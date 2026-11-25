"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark,BookmarkCheck, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-controls";
import { submitReviewAction, toggleSaveJobAction } from "@/services/actions";

export function SaveAndShareButtons({
  jobId,
  initialSaved,
}: {
  jobId: string;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initialSaved);
  const [loading, setLoading] = React.useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await toggleSaveJobAction(jobId);
    setLoading(false);

    if (!res.ok) {
      toast.info(res.message);
      if (res.redirectTo) router.push(res.redirectTo);
      return;
    }
    setSaved(Boolean(res.data?.saved));
    toast.success(res.message);
    router.refresh();
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép đường dẫn công việc vào khay nhớ tạm!");
    } catch {
      toast.info("Hãy sao chép URL trên thanh địa chỉ trình duyệt để chia sẻ.");
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <Button
        variant={saved ? "secondary" : "outline"}
        onClick={handleSave}
        disabled={loading}
      >
        {saved ? (
          <>
            <BookmarkCheck className="h-4 w-4 text-blue-700" />
            Đã lưu việc
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            Lưu công việc
          </>
        )}
      </Button>
      <Button variant="outline" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Chia sẻ
      </Button>
    </div>
  );
}

export function JobReviewForm({
  jobId,
  employerId,
}: {
  jobId: string;
  employerId: string;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await submitReviewAction({
      job_id: jobId,
      employer_id: employerId,
      rating,
      comment,
    });
    setLoading(false);
    if (res.ok) {
      toast.success(res.message);
      setComment("");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/40 p-5 space-y-3"
    >
      <h4 className="text-sm font-bold text-slate-900">
        Gửi đánh giá của bạn sau khi nhận việc
      </h4>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1"
            aria-label={`${star} sao`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-medium text-slate-600">
          {rating}/5 sao
        </span>
      </div>
      <Textarea
        required
        placeholder="Chia sẻ trải nghiệm thực tế của bạn về môi trường làm việc, sự minh bạch khi trả lương..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[85px]"
      />
      <Button type="submit" variant="primary" size="sm" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}
