using System;

namespace Ketabino.Models
{
    public class ReadingProgressRequest
    {
        public long LastReadChapterId { get; set; }
        public int LastReadPosition { get; set; }
    }

    public class ReadingProgressResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public long? LastReadChapterId { get; set; }
        public string? LastReadChapterTitle { get; set; }
        public int LastReadPosition { get; set; }
        public DateTime LastReadAt { get; set; }
    }

    public class BookmarkRequest
    {
        public long ChapterId { get; set; }
        public int Position { get; set; }
        public string? Note { get; set; }
    }

    public class BookmarkResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long ChapterId { get; set; }
        public string ChapterTitle { get; set; } = string.Empty;
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int Position { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class HighlightRequest
    {
        public long ChapterId { get; set; }
        public int StartChar { get; set; }
        public int EndChar { get; set; }
        public string Color { get; set; } = "#FFEB3B"; // Default yellow HEX
        public string TextContent { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class HighlightResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long ChapterId { get; set; }
        public string ChapterTitle { get; set; } = string.Empty;
        public long BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int StartChar { get; set; }
        public int EndChar { get; set; }
        public string Color { get; set; } = string.Empty;
        public string TextContent { get; set; } = string.Empty;
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
