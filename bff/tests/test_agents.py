"""Agent structure tests — verify agent definitions are correctly configured.

These tests only import the agent modules; they don't make API calls.
"""

def test_genesis_agent_has_sub_agents():
    from agents.genesis_agent import genesis_agent

    assert len(genesis_agent.sub_agents) == 4
    names = {a.name for a in genesis_agent.sub_agents}
    assert names == {"train", "fuel", "mind", "track"}


def test_genesis_agent_has_tools():
    from agents.genesis_agent import genesis_agent

    assert len(genesis_agent.tools) == 3
    tool_names = {t.__name__ for t in genesis_agent.tools}
    assert "get_user_profile" in tool_names
    assert "get_current_season" in tool_names
    assert "get_today_checkin" in tool_names


def test_train_agent_has_tools():
    from agents.train_agent import train_agent

    assert train_agent.name == "train"
    assert len(train_agent.tools) == 4


def test_fuel_agent_has_tools():
    from agents.fuel_agent import fuel_agent

    assert fuel_agent.name == "fuel"
    assert len(fuel_agent.tools) == 4


def test_mind_agent_has_tools():
    from agents.mind_agent import mind_agent

    assert mind_agent.name == "mind"
    assert len(mind_agent.tools) == 2


def test_track_agent_has_tools():
    from agents.track_agent import track_agent

    assert track_agent.name == "track"
    assert len(track_agent.tools) == 3


def test_all_agents_use_correct_model():
    from agents.genesis_agent import genesis_agent

    assert genesis_agent.model == "gemini-2.5-flash"
    for sub in genesis_agent.sub_agents:
        assert sub.model == "gemini-2.5-flash", f"{sub.name} uses wrong model"


def test_genesis_agent_name():
    from agents.genesis_agent import genesis_agent

    assert genesis_agent.name == "genesis"


def test_no_agent_identity_leak_in_instructions():
    """Verify no instruction reveals internal agent structure."""
    from agents.genesis_agent import genesis_agent

    forbidden = ["agente Train", "agente Fuel", "agente Mind", "agente Track",
                 "sub-agente", "sub_agente", "delega al especialista",
                 "4 agentes especialistas"]

    all_agents = [genesis_agent] + list(genesis_agent.sub_agents)
    for agent in all_agents:
        for phrase in forbidden:
            assert phrase not in agent.instruction, (
                f"Agent '{agent.name}' instruction contains forbidden phrase: '{phrase}'"
            )


def test_all_agents_identify_as_genesis():
    """Verify all agents present themselves as GENESIS."""
    from agents.genesis_agent import genesis_agent

    all_agents = [genesis_agent] + list(genesis_agent.sub_agents)
    for agent in all_agents:
        assert "GENESIS" in agent.instruction, (
            f"Agent '{agent.name}' instruction doesn't mention GENESIS"
        )


def test_all_agents_have_widget_instruction():
    """Verify all agents include widget instruction block."""
    from agents.genesis_agent import genesis_agent

    all_agents = [genesis_agent] + list(genesis_agent.sub_agents)
    for agent in all_agents:
        assert "widget" in agent.instruction.lower(), (
            f"Agent '{agent.name}' instruction missing widget instructions"
        )
