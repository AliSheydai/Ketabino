using System;

namespace Ketabino.Models
{
    public class ReportRequest
    {
        public string TargetType { get; set; } = string.Empty; // "Book", "Chapter", "Comment"
        public long TargetId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class ReportResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string TargetType { get; set; } = string.Empty;
        public long TargetId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty; // "Pending", "Resolved", "Dismissed"
        public DateTime CreatedAt { get; set; }
    }
}
