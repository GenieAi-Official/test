import importlib.util
import unittest
from pathlib import Path


SPEC = importlib.util.spec_from_file_location(
    "ai_landscape_run", Path(__file__).parents[1] / "run.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


class ValidationTests(unittest.TestCase):
    def test_valid_daily(self):
        body = "事实说明和实际影响" * 32
        text = (
            "- 【发生了什么】发布重要更新。"
            f"【为什么重要】{body}【来源】https://example.com/news\n"
            "【行动建议】今天阅读官方更新并完成一次试用。"
        )
        self.assertEqual([], MODULE.validate_daily(text))

    def test_daily_requires_action_as_final_line(self):
        text = (
            "- 【发生了什么】发布更新。【为什么重要】实际影响。"
            "【来源】https://example.com\n"
            "【行动建议】试用。\n多余内容"
        )
        self.assertIn(
            "最后一个非空行必须以【行动建议】开头",
            MODULE.validate_daily(text),
        )

    def test_previous_report_selection(self):
        pages = [
            ("AI Landscape Report - 2026-06-08", "old"),
            ("AI Landscape Report - 2026-06-15", "latest"),
            ("Other", "ignored"),
        ]
        self.assertEqual(
            ("AI Landscape Report - 2026-06-15", "latest"),
            MODULE.choose_previous_report(pages, before_date="2026-06-22"),
        )


if __name__ == "__main__":
    unittest.main()
