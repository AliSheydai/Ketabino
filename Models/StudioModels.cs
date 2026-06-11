using System;

namespace Ketabino.Models
{
    public class AuthorStatsResponse
    {
        public int TotalBooks { get; set; }
        public int TotalChapters { get; set; }
        public decimal TotalCoinsEarned { get; set; }
        public int TotalPurchases { get; set; }
        public int TotalLikes { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
    }

    public class WriterStudioAssetRequest
    {
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = "Draft"; // "Draft", "Reference", "Outline", "Cover"
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }

    public class WriterStudioAssetResponse
    {
        public long Id { get; set; }
        public long AuthorId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
