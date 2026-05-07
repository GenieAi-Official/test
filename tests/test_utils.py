import unittest

from xhs_scraper.utils import extract_note_id, extract_user_id, find_best_note_payload


class UtilsTest(unittest.TestCase):
    def test_extract_note_id(self):
        self.assertEqual(
            extract_note_id("https://www.xiaohongshu.com/explore/abc123?x=1"),
            "abc123",
        )

    def test_extract_user_id(self):
        self.assertEqual(
            extract_user_id("https://www.xiaohongshu.com/user/profile/u001?x=1"),
            "u001",
        )

    def test_find_best_note_payload(self):
        state = {
            "a": {"title": "x", "desc": "y", "noteId": "n1", "user": {"nickname": "u"}},
            "b": {"title": "", "desc": "", "noteId": "n2"},
        }
        best = find_best_note_payload(state, "n1")
        self.assertIsNotNone(best)
        self.assertEqual(best.get("noteId"), "n1")


if __name__ == "__main__":
    unittest.main()

