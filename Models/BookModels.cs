using System;
using System.Collections.Generic;

namespace Ketabino.Models
{
    public class BookRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImage { get; set; }
        public string Status { get; set; } = "Draft"; // "Draft", "Published", "Archived"
        public List<int> GenreIds { get; set; } = new();
    }

    public class BookResponse
    {
        public long Id { get; set; }
        public long AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<GenreResponse> Genres { get; set; } = new();
        public int ChaptersCount { get; set; }
        public int LikesCount { get; set; }
        public double AverageRating { get; set; }
        public bool IsLiked { get; set; }
    }

    public class GenreResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ChapterRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int SequenceNumber { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public string Status { get; set; } = "Draft"; // "Draft", "Published"
    }

    public class ChapterResponse
    {
        public long Id { get; set; }
        public long BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int SequenceNumber { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsPurchased { get; set; }
        public string? Content { get; set; } // Null if user hasn't purchased and it's not free
    }

    public class ReviewRequest
    {
        public int Rating { get; set; } // 1-5
        public string? Title { get; set; }
        public string? Content { get; set; }
    }

    public class ReviewResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public long BookId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CommentRequest
    {
        public string Content { get; set; } = string.Empty;
        public long? ChapterId { get; set; }
        public long? ParentCommentId { get; set; }
    }

    public class CommentResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public long BookId { get; set; }
        public long? ChapterId { get; set; }
        public long? ParentCommentId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<CommentResponse> Replies { get; set; } = new();
    }
}
