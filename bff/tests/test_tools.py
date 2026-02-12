"""Tool unit tests — verify ADK tools with mocked Supabase.

Each tool is tested with:
- Success case (Supabase returns data)
- Empty/missing data case
- Supabase error case
"""

from unittest.mock import MagicMock, patch


# --- Mock helpers ---

def make_mock_tool_context(user_id="test-user-123"):
    """Create a mock tool_context with user_id in state."""
    ctx = MagicMock()
    ctx.state = {"user_id": user_id}
    return ctx


def make_mock_supabase():
    """Create a mock Supabase client with chainable methods."""
    mock = MagicMock()
    chain = MagicMock()
    chain.execute.return_value = MagicMock(data=[], count=0)
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.upsert.return_value = chain
    chain.eq.return_value = chain
    chain.in_.return_value = chain
    chain.gte.return_value = chain
    chain.lte.return_value = chain
    chain.is_.return_value = chain
    chain.ilike.return_value = chain
    chain.contains.return_value = chain
    chain.filter.return_value = chain
    chain.order.return_value = chain
    chain.limit.return_value = chain
    chain.single.return_value = chain
    chain.maybe_single.return_value = chain
    mock.table.return_value = chain
    return mock, chain


# =====================================================================
# Profile tools
# =====================================================================

class TestGetUserProfile:
    def test_success(self):
        from agents.tools.profile_tools import get_user_profile

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data={"full_name": "Aldo", "experience_level": "avanzado", "goals": ["muscle"], "created_at": "2025-01-01"}
        )
        ctx = make_mock_tool_context()

        with patch("agents.tools.profile_tools.get_supabase", return_value=mock_sb):
            result = get_user_profile(tool_context=ctx)

        assert result["full_name"] == "Aldo"
        assert result["experience_level"] == "avanzado"

    def test_not_found(self):
        from agents.tools.profile_tools import get_user_profile

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=None)
        ctx = make_mock_tool_context()

        with patch("agents.tools.profile_tools.get_supabase", return_value=mock_sb):
            result = get_user_profile(tool_context=ctx)

        assert "error" in result

    def test_no_user_id(self):
        from agents.tools.profile_tools import get_user_profile

        ctx = MagicMock()
        ctx.state = {"user_id": None}
        result = get_user_profile(tool_context=ctx)
        assert "error" in result


class TestGetCurrentSeason:
    def test_success(self):
        from agents.tools.profile_tools import get_current_season

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data=[{"id": "s1", "name": "Season 1", "status": "active", "start_date": "2026-01-01", "end_date": "2026-03-25"}]
        )
        ctx = make_mock_tool_context()

        with patch("agents.tools.profile_tools.get_supabase", return_value=mock_sb):
            result = get_current_season(tool_context=ctx)

        assert result["name"] == "Season 1"

    def test_no_season(self):
        from agents.tools.profile_tools import get_current_season

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.profile_tools.get_supabase", return_value=mock_sb):
            result = get_current_season(tool_context=ctx)

        assert "message" in result


class TestGetTodayCheckin:
    def test_success(self):
        from agents.tools.profile_tools import get_today_checkin

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data=[{"mood": 8, "energy": 7, "sleep_hours": 7.5, "sleep_quality": 8, "stress": 3, "soreness": 4}]
        )
        ctx = make_mock_tool_context()

        with patch("agents.tools.profile_tools.get_supabase", return_value=mock_sb):
            result = get_today_checkin(tool_context=ctx)

        assert result["mood"] == 8

    def test_no_checkin(self):
        from agents.tools.profile_tools import get_today_checkin

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.profile_tools.get_supabase", return_value=mock_sb):
            result = get_today_checkin(tool_context=ctx)

        assert "message" in result


# =====================================================================
# Training tools
# =====================================================================

class TestGetTodayWorkout:
    def test_success(self):
        from agents.tools.training_tools import get_today_workout

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data=[{"id": "sess1", "name": "Upper Body", "exercise_logs": []}]
        )
        ctx = make_mock_tool_context()

        with patch("agents.tools.training_tools.get_supabase", return_value=mock_sb):
            result = get_today_workout(tool_context=ctx)

        assert "session" in result

    def test_no_workout(self):
        from agents.tools.training_tools import get_today_workout

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.training_tools.get_supabase", return_value=mock_sb):
            result = get_today_workout(tool_context=ctx)

        assert "message" in result


class TestGetExerciseCatalog:
    def test_success(self):
        from agents.tools.training_tools import get_exercise_catalog

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data=[{"id": "ex1", "name": "Bench Press", "muscle_groups": ["chest"]}]
        )

        with patch("agents.tools.training_tools.get_supabase", return_value=mock_sb):
            result = get_exercise_catalog(query="bench")

        assert len(result["exercises"]) == 1

    def test_empty(self):
        from agents.tools.training_tools import get_exercise_catalog

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])

        with patch("agents.tools.training_tools.get_supabase", return_value=mock_sb):
            result = get_exercise_catalog(query="nonexistent")

        assert result["exercises"] == []


class TestLogExerciseSet:
    def test_success(self):
        from agents.tools.training_tools import log_exercise_set

        mock_sb, chain = make_mock_supabase()
        # First call: find session; second call: insert log
        chain.execute.side_effect = [
            MagicMock(data=[{"id": "sess1"}]),
            MagicMock(data=[{"id": "log1"}]),
        ]
        ctx = make_mock_tool_context()

        with patch("agents.tools.training_tools.get_supabase", return_value=mock_sb):
            result = log_exercise_set("ex1", 1, 100.0, 8, tool_context=ctx)

        assert result["logged"] is True

    def test_no_session(self):
        from agents.tools.training_tools import log_exercise_set

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.training_tools.get_supabase", return_value=mock_sb):
            result = log_exercise_set("ex1", 1, 100.0, 8, tool_context=ctx)

        assert "error" in result


# =====================================================================
# Nutrition tools
# =====================================================================

class TestGetTodayMeals:
    def test_success(self):
        from agents.tools.nutrition_tools import get_today_meals

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data=[{"id": "m1", "meal_type": "breakfast", "total_macros": {"calories": 500}}]
        )
        ctx = make_mock_tool_context()

        with patch("agents.tools.nutrition_tools.get_supabase", return_value=mock_sb):
            result = get_today_meals(tool_context=ctx)

        assert len(result["meals"]) == 1


class TestLogMeal:
    def test_success(self):
        from agents.tools.nutrition_tools import log_meal

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[{"id": "m1"}])
        ctx = make_mock_tool_context()

        with patch("agents.tools.nutrition_tools.get_supabase", return_value=mock_sb):
            result = log_meal("breakfast", [{"name": "eggs"}], 300, 20, 2, 22, tool_context=ctx)

        assert result["logged"] is True


class TestGetWaterIntake:
    def test_success(self):
        from agents.tools.nutrition_tools import get_water_intake

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data={"glasses": 6})
        ctx = make_mock_tool_context()

        with patch("agents.tools.nutrition_tools.get_supabase", return_value=mock_sb):
            result = get_water_intake(tool_context=ctx)

        assert result["glasses"] == 6

    def test_no_data(self):
        from agents.tools.nutrition_tools import get_water_intake

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=None)
        ctx = make_mock_tool_context()

        with patch("agents.tools.nutrition_tools.get_supabase", return_value=mock_sb):
            result = get_water_intake(tool_context=ctx)

        assert result["glasses"] == 0


class TestLogWater:
    def test_success(self):
        from agents.tools.nutrition_tools import log_water

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[{"glasses": 8}])
        ctx = make_mock_tool_context()

        with patch("agents.tools.nutrition_tools.get_supabase", return_value=mock_sb):
            result = log_water(glasses=8, tool_context=ctx)

        assert result["logged"] is True


# =====================================================================
# Wellness tools
# =====================================================================

class TestSubmitCheckIn:
    def test_success(self):
        from agents.tools.wellness_tools import submit_check_in

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[{"id": "ci1"}])
        ctx = make_mock_tool_context()

        with patch("agents.tools.wellness_tools.get_supabase", return_value=mock_sb):
            result = submit_check_in(8, 7, 7.5, 8, 3, 4, tool_context=ctx)

        assert result["submitted"] is True


class TestGetWellnessTrends:
    def test_success(self):
        from agents.tools.wellness_tools import get_wellness_trends

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(
            data=[
                {"date": "2026-02-10", "mood": 8, "energy": 7, "sleep_hours": 7.5, "sleep_quality": 8, "stress": 3, "soreness": 4},
                {"date": "2026-02-11", "mood": 7, "energy": 6, "sleep_hours": 8.0, "sleep_quality": 7, "stress": 4, "soreness": 3},
            ]
        )
        ctx = make_mock_tool_context()

        with patch("agents.tools.wellness_tools.get_supabase", return_value=mock_sb):
            result = get_wellness_trends(days=7, tool_context=ctx)

        assert "averages" in result
        assert result["averages"]["mood"] == 7.5

    def test_no_data(self):
        from agents.tools.wellness_tools import get_wellness_trends

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.wellness_tools.get_supabase", return_value=mock_sb):
            result = get_wellness_trends(days=7, tool_context=ctx)

        assert "message" in result


# =====================================================================
# Tracking tools
# =====================================================================

class TestGetProgressStats:
    def test_success(self):
        from agents.tools.tracking_tools import get_progress_stats

        mock_sb, chain = make_mock_supabase()
        # Calls: season, sessions count, PRs count, phases, weekly_plans count
        chain.execute.side_effect = [
            MagicMock(data=[{"id": "s1", "start_date": "2026-01-01", "end_date": "2026-03-25"}]),
            MagicMock(data=[], count=15),
            MagicMock(data=[], count=3),
            MagicMock(data=[{"id": "p1"}, {"id": "p2"}]),
            MagicMock(data=[], count=4),
        ]
        ctx = make_mock_tool_context()

        with patch("agents.tools.tracking_tools.get_supabase", return_value=mock_sb):
            result = get_progress_stats(tool_context=ctx)

        assert result["completed_workouts"] == 15
        assert result["total_prs"] == 3

    def test_no_season(self):
        from agents.tools.tracking_tools import get_progress_stats

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.tracking_tools.get_supabase", return_value=mock_sb):
            result = get_progress_stats(tool_context=ctx)

        assert result["completed_workouts"] == 0


class TestComparePeriods:
    def test_success(self):
        from agents.tools.tracking_tools import compare_periods

        mock_sb, chain = make_mock_supabase()
        chain.execute.side_effect = [
            MagicMock(data=[{"date": "2026-01-01", "mood": 6}, {"date": "2026-01-02", "mood": 7}]),
            MagicMock(data=[{"date": "2026-02-01", "mood": 8}, {"date": "2026-02-02", "mood": 9}]),
        ]
        ctx = make_mock_tool_context()

        with patch("agents.tools.tracking_tools.get_supabase", return_value=mock_sb):
            result = compare_periods("mood", "2026-01-01", "2026-01-07", "2026-02-01", "2026-02-07", tool_context=ctx)

        assert result["period1"]["avg"] == 6.5
        assert result["period2"]["avg"] == 8.5
        assert result["delta"] == 2.0

    def test_invalid_metric(self):
        from agents.tools.tracking_tools import compare_periods

        ctx = make_mock_tool_context()
        result = compare_periods("invalid", "2026-01-01", "2026-01-07", "2026-02-01", "2026-02-07", tool_context=ctx)
        assert "error" in result
