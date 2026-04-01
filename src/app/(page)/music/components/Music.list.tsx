/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2,
  Disc3,
  Clock,
  Play,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Globe,
  Check,
  Heart,
  MessageCircle,
  Download,
  X,
  Send,
  Loader2,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import { fetchAllMusic } from "../../../lib/features/music/music.slice";
import {
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

// ── Hardcoded demo userId (replace with real auth) ───────────────────────────
const DEMO_USER_ID = "507f1f77bcf86cd799439011";

interface MusicItem {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: string;
  duration: number;
  coverImageUrl: string | null;
  musicUrl?: string;
  lyrics?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString();
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  );
}

// ── Per-track activity selector wrapper ─────────────────────────────────────
function TrackActivityRow({
  track,
  index,
  isPlaying,
  onPlay,
  onCommentOpen,
  onDownload,
  downloading,
}: {
  track: MusicItem;
  index: number;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onCommentOpen: (track: MusicItem) => void;
  onDownload: (e: React.MouseEvent, track: MusicItem) => void;
  downloading: boolean;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const likes = useAppSelector(selectLikesByTrackId(track._id));
  const commentsState = useAppSelector(selectCommentsByTrackId(track._id));

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(optimisticToggleLike({ trackId: track._id }));
      try {
        await dispatch(
          toggleLike({ trackId: track._id, userId: DEMO_USER_ID }),
        ).unwrap();
      } catch {
        // Revert optimistic update on failure
        dispatch(optimisticToggleLike({ trackId: track._id }));
      }
    },
    [dispatch, track._id],
  );

  return (
    <motion.div
      key={track._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => {
        onPlay(track._id);
        router.push(`/music/${track._id}`);
      }}
      className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/60 cursor-pointer transition-colors group relative"
    >
      {/* Playing indicator bar */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="playing-bar"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-900 dark:bg-white rounded-r origin-bottom"
          />
        )}
      </AnimatePresence>

      {/* Index / Play */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            {[3, 5, 4, 6, 3].map((h, idx) => (
              <motion.div
                key={idx}
                className="w-0.75 rounded-full bg-gray-900 dark:bg-white"
                style={{ height: h }}
                animate={{ height: [h, h * 2.2, h] }}
                transition={{
                  duration: 0.6 + idx * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: idx * 0.1,
                }}
              />
            ))}
          </div>
        ) : (
          <>
            <span className="text-[11px] text-gray-300 dark:text-gray-600 font-mono group-hover:hidden">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Play
              className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hidden group-hover:block"
              strokeWidth={2}
              fill="currentColor"
            />
          </>
        )}
      </div>

      {/* Cover */}
      <div className="w-11 h-11 rounded-xl shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
        {track.coverImageUrl ? (
          <img
            src={track.coverImageUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Disc3
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
            strokeWidth={1.5}
          />
        )}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 bg-gray-900/10 dark:bg-white/10 rounded-xl"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate leading-none mb-1 text-gray-900 dark:text-white">
          {track.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {track.artist}
        </p>
      </div>

      {/* Album */}
      <div className="hidden sm:block w-36 shrink-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {track.album}
        </p>
      </div>

      {/* Genre tag */}
      <div className="hidden md:flex shrink-0">
        <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 capitalize">
          {track.genre}
        </span>
      </div>

      {/* Year */}
      <div className="hidden sm:block shrink-0 w-10 text-right">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {formatYear(track.releaseDate)}
        </p>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400 dark:text-gray-500">
        <Clock className="w-3 h-3" strokeWidth={1.8} />
        {formatDuration(track.duration)}
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center gap-1 shrink-0 ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={handleLike}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            likes.userLiked
              ? "text-red-500 bg-red-50 dark:bg-red-950/30"
              : "text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          }`}
        >
          <motion.div
            animate={likes.userLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-3.5 h-3.5 ${likes.userLiked ? "fill-current" : ""}`}
              strokeWidth={1.8}
            />
          </motion.div>
          {likes.count ? <span>{likes.count}</span> : null}
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={(e) => {
            e.stopPropagation();
            onCommentOpen(track);
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.8} />
          {commentsState.total ? <span>{commentsState.total}</span> : null}
        </motion.button>

        {/* Download */}
        {track.musicUrl && (
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={(e) => onDownload(e, track)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <motion.div
              animate={downloading ? { y: [0, 3, 0] } : { y: 0 }}
              transition={{
                duration: 0.5,
                repeat: downloading ? Infinity : 0,
              }}
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
            </motion.div>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ── Comment Modal ────────────────────────────────────────────────────────────
function CommentModal({
  track,
  onClose,
}: {
  track: MusicItem;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const commentsState = useAppSelector(selectCommentsByTrackId(track._id));
  const commentsLoading = useAppSelector((state) => state.comments.loading);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    dispatch(fetchComments({ trackId: track._id }));
  }, [dispatch, track._id]);

  const submit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await dispatch(
        addComment({
          trackId: track._id,
          userId: DEMO_USER_ID,
          text: text.trim(),
        }),
      ).unwrap();
      setText("");
    } catch {}
    setSubmitting(false);
  }, [dispatch, text, submitting, track._id]);

  const comments = commentsState.data;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                {track.coverImageUrl ? (
                  <img
                    src={track.coverImageUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Disc3
                    className="w-4 h-4 text-gray-400 m-auto mt-2"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                  {track.title}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {track.artist}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          {/* Comment list */}
          <div className="max-h-64 overflow-y-auto px-5 py-3 space-y-3">
            {commentsLoading && comments.length === 0 && (
              <div className="flex justify-center py-6">
                <Loader2
                  className="w-4 h-4 animate-spin text-gray-400"
                  strokeWidth={2}
                />
              </div>
            )}
            {!commentsLoading && comments.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-6">
                No comments yet. Be the first!
              </p>
            )}
            {comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-white dark:text-gray-900">
                    {(c.userId?.[0] ?? "U").toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                    Anonymous
                  </p>
                  <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
            />
            <button
              onClick={submit}
              disabled={!text.trim() || submitting}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Send className="w-3.5 h-3.5 translate-x-px" strokeWidth={2} />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MusicList() {
  const dispatch = useAppDispatch();

  const tracks = useAppSelector(selectAllTracks);
  const loading = useAppSelector(selectMusicLoading);
  const error = useAppSelector(selectMusicError);

  const [playingId, setPlayingId] = useState<string | null>(null);

  // Search + filter state
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "default" | "mostLiked" | "mostCommented"
  >("default");
  const filterRef = useRef<HTMLDivElement>(null);

  // Comment modal
  const [commentTrack, setCommentTrack] = useState<MusicItem | null>(null);

  // Download state
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  // Redux selectors for sort (need all likes/comments from store)
  const likesState = useAppSelector((state) => state.likes.byTrackId);
  const commentsState = useAppSelector((state) => state.comments.byTrackId);

  // ── Fetch tracks on mount ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAllMusic());
  }, [dispatch]);

  // ── Fetch likes + comment counts for all tracks ──────────────────────────────
  useEffect(() => {
    if (!tracks.length) return;
    tracks.forEach((track) => {
      dispatch(fetchLikes({ trackId: track._id, userId: DEMO_USER_ID }));
      dispatch(fetchComments({ trackId: track._id, limit: 1 }));
    });
  }, [dispatch, tracks]);

  // ── Download ─────────────────────────────────────────────────────────────────
  const handleDownload = useCallback(
    async (e: React.MouseEvent, track: MusicItem) => {
      e.stopPropagation();
      if (!track.musicUrl || downloading[track._id]) return;
      setDownloading((d) => ({ ...d, [track._id]: true }));
      try {
        const a = document.createElement("a");
        a.href = track.musicUrl!;
        a.download = `${track.title} - ${track.artist}.mp3`;
        a.target = "_blank";
        a.click();
      } catch {}
      setTimeout(
        () => setDownloading((d) => ({ ...d, [track._id]: false })),
        1500,
      );
    },
    [downloading],
  );

  // ── Close filter on outside click ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    if (filterOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const genres = Array.from(
    new Set(tracks.map((t) => t.genre).filter(Boolean)),
  );

  // ── Filter + sort ────────────────────────────────────────────────────────────
  const filtered = (tracks as MusicItem[])
    .filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q);
      const matchGenre = !selectedGenre || t.genre === selectedGenre;
      return matchSearch && matchGenre;
    })
    .sort((a, b) => {
      if (sortBy === "mostLiked")
        return (
          (likesState[b._id]?.count ?? 0) - (likesState[a._id]?.count ?? 0)
        );
      if (sortBy === "mostCommented")
        return (
          (commentsState[b._id]?.total ?? 0) -
          (commentsState[a._id]?.total ?? 0)
        );
      return 0;
    });

  const sortLabel =
    sortBy === "mostLiked"
      ? "Most Liked"
      : sortBy === "mostCommented"
        ? "Most Commented"
        : "Default";

  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-[50vw] max-w-[50vw] overflow-hidden bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
        {/* ── Top bar ── */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none"
              strokeWidth={1.8}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracks, artists..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() =>
                setSortBy((s) => {
                  if (s === "default") return "mostLiked";
                  if (s === "mostLiked") return "mostCommented";
                  return "default";
                })
              }
              className={`
                inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border text-xs font-medium transition-colors shrink-0
                ${
                  sortBy !== "default"
                    ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                }
              `}
            >
              <TrendingUp className="w-3 h-3" strokeWidth={2} />
              <span className="hidden sm:inline">{sortLabel}</span>
              <ChevronDown className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>

          {/* Filter button + dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-xl border transition-colors shrink-0
                ${
                  filterOpen || selectedGenre
                    ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                }
              `}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-11 z-50 w-52 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                      Filter by Genre
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGenre(null);
                      setFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors text-left ${!selectedGenre ? "text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                    <span className="flex-1">All Genres</span>
                    {!selectedGenre && (
                      <Check
                        className="w-3 h-3 text-gray-900 dark:text-white"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>

                  <div className="mx-4 border-t border-gray-100 dark:border-gray-800 my-1" />

                  {genres.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 px-4 py-3">
                      No genres found
                    </p>
                  )}
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setFilterOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors text-left ${selectedGenre === genre ? "text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        ♪
                      </span>
                      <span className="flex-1 capitalize">{genre}</span>
                      {selectedGenre === genre && (
                        <Check
                          className="w-3 h-3 text-gray-900 dark:text-white"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  ))}
                  <div className="pb-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto">
          {loading && [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}

          {error && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 h-full">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
                <AlertTriangle
                  className="w-5 h-5 text-red-500 dark:text-red-400"
                  strokeWidth={1.8}
                />
              </div>
              <div className="text-center max-w-sm">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {error}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Could not connect to the music API.
                </p>
              </div>
              <button
                onClick={() => dispatch(fetchAllMusic())}
                className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 p-8 h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <Music2
                  className="w-5 h-5 text-gray-400 dark:text-gray-500"
                  strokeWidth={1.8}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {search || selectedGenre
                  ? "No tracks match your filter."
                  : "No tracks found."}
              </p>
              {(search || selectedGenre) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedGenre(null);
                  }}
                  className="text-xs text-gray-400 dark:text-gray-500 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="max-w-6xl mx-auto">
              {filtered.map((track, i) => (
                <TrackActivityRow
                  key={track._id}
                  track={track}
                  index={i}
                  isPlaying={playingId === track._id}
                  onPlay={setPlayingId}
                  onCommentOpen={setCommentTrack}
                  onDownload={handleDownload}
                  downloading={!!downloading[track._id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Comment Modal ── */}
      {commentTrack && (
        <CommentModal
          track={commentTrack}
          onClose={() => setCommentTrack(null)}
        />
      )}
    </>
  );
}
