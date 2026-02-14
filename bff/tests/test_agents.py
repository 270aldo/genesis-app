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

    assert len(genesis_agent.tools) == 6  # 5 original + search_knowledge
    tool_names = {t.__name__ for t in genesis_agent.tools}
    assert "get_user_profile" in tool_names
    assert "get_current_season" in tool_names
    assert "get_today_checkin" in tool_names
    assert "get_user_memories" in tool_names
    assert "store_user_memory" in tool_names
    assert "search_knowledge" in tool_names


def test_train_agent_has_tools():
    from agents.train_agent import train_agent

    assert train_agent.name == "train"
    assert len(train_agent.tools) == 5  # 4 original + search_knowledge


def test_fuel_agent_has_tools():
    from agents.fuel_agent import fuel_agent

    assert fuel_agent.name == "fuel"
    assert len(fuel_agent.tools) == 6  # 4 original + search_knowledge + google_search


def test_mind_agent_has_tools():
    from agents.mind_agent import mind_agent

    assert mind_agent.name == "mind"
    assert len(mind_agent.tools) == 4  # 2 original + search_knowledge + google_search


def test_track_agent_has_tools():
    from agents.track_agent import track_agent

    assert track_agent.name == "track"
    assert len(track_agent.tools) == 4  # 3 original + search_knowledge


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

    forbidden = [
        "agente Train",
        "agente Fuel",
        "agente Mind",
        "agente Track",
        "sub-agente",
        "sub_agente",
        "delega al especialista",
        "4 agentes especialistas",
    ]

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


def test_genesis_agent_has_memory_instruction():
    """Verify genesis agent instruction includes memory usage guidance."""
    from agents.genesis_agent import genesis_agent

    assert "get_user_memories" in genesis_agent.instruction
    assert "store_user_memory" in genesis_agent.instruction
    assert "Memoria" in genesis_agent.instruction


# -- Sprint 4: New tests --


def _tool_name(t):
    """Extract tool name from either a function or a tool object."""
    return getattr(t, "__name__", None) or type(t).__name__


def test_all_agents_have_search_knowledge_tool():
    """All 5 agents should have the search_knowledge tool."""
    from agents.genesis_agent import genesis_agent

    all_agents = [genesis_agent] + list(genesis_agent.sub_agents)
    for agent in all_agents:
        tool_names = {_tool_name(t) for t in agent.tools}
        assert "search_knowledge" in tool_names, (
            f"Agent '{agent.name}' is missing search_knowledge tool"
        )


def test_fuel_agent_has_google_search_tool():
    """FUEL agent should have GoogleSearch for real-time food data."""
    from agents.fuel_agent import fuel_agent

    tool_strs = [str(t) for t in fuel_agent.tools]
    assert any(
        "google_search" in s.lower() or "GoogleSearch" in s
        for s in tool_strs
    ), "FUEL agent missing GoogleSearch tool"


def test_mind_agent_has_google_search_tool():
    """MIND agent should have GoogleSearch for latest research."""
    from agents.mind_agent import mind_agent

    tool_strs = [str(t) for t in mind_agent.tools]
    assert any(
        "google_search" in s.lower() or "GoogleSearch" in s
        for s in tool_strs
    ), "MIND agent missing GoogleSearch tool"


def test_train_agent_does_not_have_google_search():
    """TRAIN agent should NOT have GoogleSearch — uses internal data only."""
    from agents.train_agent import train_agent

    tool_strs = [str(t) for t in train_agent.tools]
    assert not any(
        "GoogleSearch" in s for s in tool_strs
    ), "TRAIN agent should not have GoogleSearch"


def test_all_agents_have_ngx_philosophy():
    """All agents should have NGX Philosophy prepended to their instructions."""
    from agents.genesis_agent import genesis_agent

    all_agents = [genesis_agent] + list(genesis_agent.sub_agents)
    for agent in all_agents:
        assert "NGX" in agent.instruction, (
            f"Agent '{agent.name}' missing NGX Philosophy in instruction"
        )
        assert "Periodization" in agent.instruction or "periodización" in agent.instruction.lower(), (
            f"Agent '{agent.name}' missing training principles from Philosophy"
        )


def test_all_agents_have_knowledge_instruction():
    """All agents should reference search_knowledge in their instruction."""
    from agents.genesis_agent import genesis_agent

    all_agents = [genesis_agent] + list(genesis_agent.sub_agents)
    for agent in all_agents:
        assert "search_knowledge" in agent.instruction, (
            f"Agent '{agent.name}' instruction doesn't reference search_knowledge"
        )
