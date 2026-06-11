using System;

namespace Ketabino.Models
{
    public class SubscriptionPlanResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class PurchaseSubscriptionRequest
    {
        public int PlanId { get; set; }
    }

    public class UserSubscriptionResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public int PlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty; // "Active", "Expired", "Cancelled"
    }
}
