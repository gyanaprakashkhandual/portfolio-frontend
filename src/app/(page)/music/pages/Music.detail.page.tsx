/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Disc3,
  AlertTriangle,
  Clock,
  Calendar,
  MicVocal,
  Tag,
  Heart,
  ListMusic,
  MessageCircle,
  Send,
  Loader2,
  SmilePlus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import {
  fetchMusicById,
  fetchAllMusic,
} from "../../../lib/features/music/music.slice";
import {
  selectSelectedTrack,
  selectAllTracks,
  selectMusicLoading,
  selectMusicError,
} from "../../../lib/features/music/music.selector";
import {
  fetchLikes,
  toggleLike,
  optimisticToggleLike,
} from "../../../lib/features/likes/like.slice";
import { selectLikesByTrackId } from "../../../lib/features/likes/like.selector";
import {
  fetchComments,
  addComment,
} from "../../../lib/features/comments/comment.slice";
import { selectCommentsByTrackId } from "../../../lib/features/comments/comment.selector";

// ── Hardcoded demo userId (replace with real auth) ────────────────────────────
const DEMO_USER_ID = "507f1f77bcf86cd799439011";

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SkeletonPlayer() {
  return (
    <div className="max-w-3xl min-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="flex gap-8 items-start">
        <div className="w-52 h-52 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        <div className="flex-1 space-y-4 pt-2">
          <div className="h-7 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function MusicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const track = useAppSelector(selectSelectedTrack);
  const allTracks = useAppSelector(selectAllTracks);
  const loading = useAppSelector(selectMusicLoading);
  const error = useAppSelector(selectMusicError);

  const likes = useAppSelector(selectLikesByTrackId(id ?? ""));
  const commentsState = useAppSelector(selectCommentsByTrackId(id ?? ""));
  const commentsLoading = useAppSelector((state) => state.comments.loading);

  // Player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [activeTab, setActiveTab] = useState<"lyrics" | "info" | "comments">(
    "lyrics",
  );

  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch track + all tracks ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setIsPlaying(false);
    setCurrentTime(0);
    dispatch(fetchMusicById(id));
    if (!allTracks.length) {
      dispatch(fetchAllMusic());
    }
  }, [dispatch, id, allTracks.length]);

  // ── Fetch likes + comments on track load ─────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    dispatch(fetchLikes({ trackId: id, userId: DEMO_USER_ID }));
    dispatch(fetchComments({ trackId: id }));
  }, [dispatch, id]);

  // ── Set duration from track data ─────────────────────────────────────────────
  useEffect(() => {
    if (track?.duration) setDuration(track.duration);
  }, [track]);

  // ── Audio setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!track?.musicUrl) return;
    const audio = new Audio(track.musicUrl);
    audioRef.current = audio;
    audio.volume = volume;
    audio.muted = muted;
    audio.addEventListener("timeupdate", () =>
      setCurrentTime(audio.currentTime),
    );
    audio.addEventListener("loadedmetadata", () =>
      setDuration(audio.duration || track.duration || 0),
    );
    audio.addEventListener("ended", () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else handleNext();
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setIsPlaying((p) => !p);
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const t = ratio * (duration || track?.duration || 0);
      setCurrentTime(t);
      if (audioRef.current) audioRef.current.currentTime = t;
    },
    [duration, track],
  );

  const handleNext = useCallback(() => {
    if (!allTracks.length || !track) return;
    const idx = allTracks.findIndex((t) => t._id === track._id);
    const next = shuffle
      ? allTracks.filter((t) => t._id !== track._id)[
          Math.floor(Math.random() * (allTracks.length - 1))
        ]
      : allTracks[(idx + 1) % allTracks.length];
    router.push(`/music/${next._id}`);
  }, [allTracks, track, shuffle, router]);

  const handlePrev = useCallback(() => {
    if (!allTracks.length || !track) return;
    const idx = allTracks.findIndex((t) => t._id === track._id);
    const prev = allTracks[(idx - 1 + allTracks.length) % allTracks.length];
    router.push(`/music/${prev._id}`);
  }, [allTracks, track, router]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  }, []);

  // ── Like toggle ──────────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (!id || likeLoading) return;
    setLikeLoading(true);
    dispatch(optimisticToggleLike({ trackId: id }));
    try {
      await dispatch(
        toggleLike({ trackId: id, userId: DEMO_USER_ID }),
      ).unwrap();
    } catch {
      // Revert optimistic update on failure
      dispatch(optimisticToggleLike({ trackId: id }));
    }
    setLikeLoading(false);
  }, [dispatch, id, likeLoading]);

  // ── Submit comment ───────────────────────────────────────────────────────────
  const submitComment = useCallback(async () => {
    if (!id || !commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await dispatch(
        addComment({
          trackId: id,
          userId: DEMO_USER_ID,
          text: commentText.trim(),
        }),
      ).unwrap();
      setCommentText("");
    } catch {}
    setSubmitting(false);
  }, [dispatch, id, commentText, submitting]);

  // ── Tab switch → load comments lazily ────────────────────────────────────────
  useEffect(() => {
    if (
      activeTab === "comments" &&
      id &&
      commentsState.data.length === 0 &&
      !commentsLoading
    ) {
      dispatch(fetchComments({ trackId: id }));
    }
    if (activeTab === "comments")
      setTimeout(() => commentInputRef.current?.focus(), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const comments = commentsState.data;
  const commentCount = commentsState.total;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto">
          <SkeletonPlayer />
        </div>
      </div>
    );

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !track)
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.push("/music")}
            className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              strokeWidth={1.8}
            />
            Music Library
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
            <AlertTriangle
              className="w-5 h-5 text-red-500 dark:text-red-400"
              strokeWidth={1.8}
            />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              {error ?? "Track not found."}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Could not load{" "}
              <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">
                {id}
              </code>
            </p>
          </div>
          <button
            onClick={() => router.push("/music")}
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> Back to
            Library
          </button>
        </div>
      </div>
    );

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950 main-scrollbar">
      {/* Scrollable area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl min-w-3xl mx-auto px-6 py-8">
          {/* ── Hero: Cover + Info ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-7 items-start mb-8"
          >
            <div className="w-48 h-48 shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center">
              {track.coverImageUrl ? (
                <motion.img
                  key={track._id}
                  initial={{ scale: 1.06, opacity: 0 }}
                  animate={{ scale: isPlaying ? 1.04 : 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  src={track.coverImageUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  style={
                    isPlaying ? { animation: "spin 12s linear infinite" } : {}
                  }
                />
              ) : (
                <Disc3
                  className={`w-16 h-16 text-gray-300 dark:text-gray-600 ${isPlaying ? "animate-spin" : ""}`}
                  style={isPlaying ? { animationDuration: "4s" } : {}}
                  strokeWidth={1.2}
                />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 capitalize">
                  <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                  {track.genre}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug mb-2">
                {track.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {track.artist}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                {track.album}
              </p>

              {/* Like + comment counts */}
              <div className="flex items-center gap-3 mb-4">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    likes.userLiked
                      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-500"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-400"
                  }`}
                >
                  <motion.div
                    animate={
                      likes.userLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${likes.userLiked ? "fill-current" : ""}`}
                      strokeWidth={1.8}
                    />
                  </motion.div>
                  <span>
                    {likes.count} {likes.count === 1 ? "Like" : "Likes"}
                  </span>
                </motion.button>

                <button
                  onClick={() => setActiveTab("comments")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span>
                    {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                  {formatDate(track.releaseDate)}
                </div>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                  {formatDuration(track.duration)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Player Controls ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6"
          >
            <div
              ref={progressRef}
              onClick={handleSeek}
              className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer mb-2 group relative"
            >
              <div
                className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 dark:bg-white rounded-full border-2 border-white dark:border-gray-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-5">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration || track.duration)}</span>
            </div>
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${shuffle ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"}`}
              >
                <Shuffle className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button
                onClick={handlePrev}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <SkipBack
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill="currentColor"
                />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white hover:opacity-90 transition-opacity flex items-center justify-center shrink-0 shadow-sm"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Pause
                        className="w-5 h-5 text-white dark:text-gray-900"
                        strokeWidth={2}
                        fill="currentColor"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Play
                        className="w-5 h-5 text-white dark:text-gray-900 translate-x-0.5"
                        strokeWidth={2}
                        fill="currentColor"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <SkipForward
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill="currentColor"
                />
              </button>
              <button
                onClick={() => setRepeat((r) => !r)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${repeat ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"}`}
              >
                <Repeat className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={toggleMute}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" strokeWidth={1.8} />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="flex-1 h-1 accent-gray-900 dark:accent-white cursor-pointer"
              />
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleLike}
                disabled={likeLoading}
                className={`ml-2 transition-colors ${likes.userLiked ? "text-red-500" : "text-gray-300 dark:text-gray-600 hover:text-red-400"}`}
              >
                <motion.div
                  animate={
                    likes.userLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className={`w-4 h-4 ${likes.userLiked ? "fill-current" : ""}`}
                    strokeWidth={1.8}
                  />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>

          {/* ── Tabs: Lyrics / Info / Comments ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden mb-6"
          >
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {(["lyrics", "info", "comments"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${activeTab === tab ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
                >
                  {tab === "lyrics" && (
                    <span className="flex items-center justify-center gap-1.5">
                      <MicVocal className="w-3 h-3" strokeWidth={2} />
                      Lyrics
                    </span>
                  )}
                  {tab === "info" && (
                    <span className="flex items-center justify-center gap-1.5">
                      <ListMusic className="w-3 h-3" strokeWidth={2} />
                      Track Info
                    </span>
                  )}
                  {tab === "comments" && (
                    <span className="flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-3 h-3" strokeWidth={2} />
                      Comments
                      {commentCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-bold text-gray-600 dark:text-gray-300">
                          {commentCount}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "lyrics" && (
                <motion.div
                  key="lyrics"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-5"
                >
                  {track.lyrics ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {track.lyrics}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
                      No lyrics available for this track.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 space-y-3"
                >
                  {[
                    { label: "Title", value: track.title },
                    { label: "Artist", value: track.artist },
                    { label: "Album", value: track.album },
                    { label: "Genre", value: track.genre },
                    {
                      label: "Release Date",
                      value: formatDate(track.releaseDate),
                    },
                    {
                      label: "Duration",
                      value: formatDuration(track.duration),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                    >
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-24 shrink-0 uppercase tracking-wide">
                        {row.label}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "comments" && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Comment input */}
                  <div className="px-5 pt-4 pb-3 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-white dark:text-gray-900">
                        Y
                      </span>
                    </div>
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitComment()}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!commentText.trim() || submitting}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
                    >
                      {submitting ? (
                        <Loader2
                          className="w-3.5 h-3.5 animate-spin"
                          strokeWidth={2}
                        />
                      ) : (
                        <Send
                          className="w-3.5 h-3.5 translate-x-1px"
                          strokeWidth={2}
                        />
                      )}
                    </button>
                  </div>

                  {/* Comment list */}
                  <div className="p-5 space-y-4 max-h-72 overflow-y-auto">
                    {commentsLoading && comments.length === 0 && (
                      <div className="flex justify-center py-4">
                        <Loader2
                          className="w-4 h-4 animate-spin text-gray-400"
                          strokeWidth={2}
                        />
                      </div>
                    )}
                    {!commentsLoading && comments.length === 0 && (
                      <div className="flex flex-col items-center gap-2 py-8">
                        <SmilePlus
                          className="w-8 h-8 text-gray-200 dark:text-gray-700"
                          strokeWidth={1.5}
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          No comments yet. Start the conversation!
                        </p>
                      </div>
                    )}
                    {comments.map((c, ci) => (
                      <motion.div
                        key={c._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ci * 0.04, duration: 0.25 }}
                        className="flex gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-white dark:text-gray-900">
                            {(c.userId?.[0] ?? "U").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 leading-none">
                              Anonymous
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-600">
                              {timeAgo(c.createdAt)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Up Next ── */}
          {allTracks.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.35 }}
            >
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                Up Next
              </p>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                {allTracks
                  .filter((t) => t._id !== track._id)
                  .slice(0, 4)
                  .map((t) => (
                    <div
                      key={t._id}
                      onClick={() => router.push(`/music/${t._id}`)}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center">
                        {t.coverImageUrl ? (
                          <img
                            src={t.coverImageUrl}
                            alt={t.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Disc3
                            className="w-4 h-4 text-gray-400"
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {t.artist}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" strokeWidth={1.8} />
                        {formatDuration(t.duration)}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
