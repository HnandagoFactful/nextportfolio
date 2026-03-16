'use client';

import { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Flex, Text, Button, Badge, TextField, Separator, TextArea } from '@radix-ui/themes';
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  CalendarIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Navigation from '@/components/globals/Navigation';

// ── Sample data ───────────────────────────────────────────────────────────────

const TAGS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'CSS',
  'Node.js', 'Python', 'SQL', 'Git', 'API', 'Rust', 'Docker',
];

const CATEGORIES = [
  'Frontend', 'Backend', 'Algorithms', 'Database',
  'DevOps', 'Mobile', 'Security', 'System Design',
];

// ── API types ─────────────────────────────────────────────────────────────────

const KNOWBLE_URL = process.env.NEXT_PUBLIC_KNOWBLE_URL ?? '';
const LIMIT = 20;

interface ApiQuestion {
  id: number;
  title: string;
  body: string | null;
  created_by: number | null;
  created_at: string;
  categories: { id: number; value: string }[];
  tags: { id: number; value: string }[];
  audio_url: string | null;
  audio_urls: string[];
  transcription_job_id: string | null;
  image_urls: string[];
  text_entries: string[];
}

interface ApiResponse {
  total: number;
  skip: number;
  limit: number;
  items: ApiQuestion[];
}

interface IQuestion {
  id: string;
  title: string;
  date: string;
  tags: string[];
  category: string;
  audioUrls: string[];
  imageUrls: string[];
}

function mapQuestion(item: ApiQuestion): IQuestion {
  return {
    id: String(item.id),
    title: item.title,
    date: item.created_at,
    tags: item.tags.map((t) => t.value.replace(/^#/, '')),
    category: item.categories[0]?.value ?? '',
    audioUrls: [
      ...(item.audio_url ? [item.audio_url] : []),
      ...item.audio_urls,
    ],
    imageUrls: item.image_urls,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Filter popover ────────────────────────────────────────────────────────────

interface FilterPopoverProps {
  selectedTags: string[];
  selectedCategory: string | null;
  onTagToggle: (tag: string) => void;
  onCategorySelect: (cat: string | null) => void;
  onClose: () => void;
}

function FilterPopover({ selectedTags, selectedCategory, onTagToggle, onCategorySelect, onClose }: FilterPopoverProps) {
  const t = useTranslations('knowble');
  return (
    <div
      style={{
        position: 'fixed',
        top: 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'min(340px, calc(100vw - 24px))',
        background: 'var(--color-panel-solid)',
        border: '1px solid var(--gray-4)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        padding: 16,
      }}
    >
      {/* Header */}
      <Flex justify="between" align="center" style={{ marginBottom: 14 }}>
        <Text size="2" weight="bold">{t('filter.title')}</Text>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-10)', display: 'flex', padding: 2 }}
        >
          <Cross2Icon />
        </button>
      </Flex>

      {/* Category */}
      <Text size="1" color="gray" weight="medium" style={{ display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {t('filter.category')}
      </Text>
      <Flex wrap="wrap" gap="1" style={{ marginBottom: 16 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategorySelect(selectedCategory === cat ? null : cat)}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: selectedCategory === cat ? 'var(--lime-8)' : 'var(--gray-4)',
              background: selectedCategory === cat ? 'var(--lime-3)' : 'var(--gray-2)',
              color: selectedCategory === cat ? 'var(--lime-11)' : 'var(--gray-11)',
              fontSize: 12,
              fontWeight: selectedCategory === cat ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </Flex>

      {/* Tags */}
      <Text size="1" color="gray" weight="medium" style={{ display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {t('filter.tags')}
      </Text>
      <Flex wrap="wrap" gap="1">
        {TAGS.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: active ? 'var(--lime-8)' : 'var(--gray-4)',
                background: active ? 'var(--lime-3)' : 'transparent',
                color: active ? 'var(--lime-11)' : 'var(--gray-10)',
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              # {tag}
            </button>
          );
        })}
      </Flex>

      {/* Clear */}
      {(selectedTags.length > 0 || selectedCategory) && (
        <button
          onClick={() => { selectedTags.forEach(onTagToggle); onCategorySelect(null); }}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '6px 0',
            background: 'none',
            border: '1px solid var(--gray-4)',
            borderRadius: 6,
            color: 'var(--gray-10)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {t('filter.clearAll')}
        </button>
      )}
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({ q }: { q: IQuestion }) {
  const t = useTranslations('knowble');
  const hasMedia = q.audioUrls.length > 0 || q.imageUrls.length > 0;
  return (
    <div
      style={{
        background: 'var(--color-panel-solid)',
        border: '1px solid var(--gray-4)',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--lime-7)';
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--lime-5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--gray-4)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Category + tags */}
      {(q.category || q.tags.length > 0) && (
        <Flex gap="1" wrap="wrap" align="center">
          {q.category && (
            <Badge color="lime" variant="soft" radius="full" style={{ fontSize: 10 }}>
              {q.category}
            </Badge>
          )}
          {q.tags.map((tag) => (
            <Badge key={tag} color="gray" variant="outline" radius="full" style={{ fontSize: 10 }}>
              # {tag}
            </Badge>
          ))}
        </Flex>
      )}

      {/* Title — 4-line clamp */}
      <Text size="3" weight="bold" style={{ lineHeight: 1.4, color: 'var(--gray-12)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {q.title}
      </Text>

      {/* Media indicators */}
      {hasMedia && (
        <Flex gap="2" align="center">
          {q.audioUrls.length > 0 && (
            <Flex gap="1" align="center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--gray-9)' }}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
              </svg>
              <Text size="1" color="gray">{t('card.audio', { count: q.audioUrls.length })}</Text>
            </Flex>
          )}
          {q.imageUrls.length > 0 && (
            <Flex gap="1" align="center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-9)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <Text size="1" color="gray">{t('card.images', { count: q.imageUrls.length })}</Text>
            </Flex>
          )}
        </Flex>
      )}

      {/* Footer */}
      <Flex justify="between" align="center" style={{ marginTop: 'auto' }}>
        <Flex gap="1" align="center">
          <CalendarIcon style={{ color: 'var(--gray-9)', width: 12, height: 12 }} />
          <Text size="1" color="gray">{formatDate(q.date)}</Text>
        </Flex>
        <Button size="1" variant="soft" color="lime" radius="full">
          {t('card.viewDetail')}
        </Button>
      </Flex>
    </div>
  );
}

// ── Post a question dialog ────────────────────────────────────────────────────

interface VoiceSegment { id: string; url: string; duration: number; }

interface PostQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  isTablet: boolean;
}

function PostQuestionDialog({ open, onClose, isMobile, isTablet }: PostQuestionDialogProps) {
  const t = useTranslations('knowble');
  // ── form state ──
  const [title, setTitle]                 = useState('');
  const [selCategory, setSelCategory]     = useState<string | null>(null);
  const [selTags, setSelTags]             = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput]           = useState('');
  const [catOpen, setCatOpen]             = useState(false);
  const [tagOpen, setTagOpen]             = useState(false);

  // ── voice recorder state ──
  const [segments, setSegments]     = useState<VoiceSegment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [reRecordIdx, setReRecordIdx] = useState<number | null>(null);

  // ── image state ──
  const [images, setImages] = useState<{ id: string; file: File; url: string }[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).map((file) => ({
      id: `img-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...added]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const streamRef         = useRef<MediaStream | null>(null);
  const chunksRef         = useRef<BlobPart[]>([]);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef        = useRef(0);
  const autoNextRef       = useRef(false);   // auto-start next segment after stop
  const reRecordIdxRef    = useRef<number | null>(null);
  const discardRef        = useRef(false);   // discard onstop result (on close/abort)

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startRecording = async (replaceIdx: number | null = null) => {
    try {
      discardRef.current      = false;
      reRecordIdxRef.current  = replaceIdx;
      chunksRef.current       = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (discardRef.current) return;

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        const seg: VoiceSegment = { id: `seg-${Date.now()}`, url, duration: elapsedRef.current };

        if (reRecordIdxRef.current !== null) {
          const idx = reRecordIdxRef.current;
          setSegments((prev) => {
            const next = [...prev];
            if (next[idx]) URL.revokeObjectURL(next[idx].url);
            next[idx] = seg;
            return next;
          });
          reRecordIdxRef.current = null;
          setReRecordIdx(null);
          setIsRecording(false);
          setElapsed(0);
          elapsedRef.current = 0;
        } else if (autoNextRef.current) {
          autoNextRef.current = false;
          setSegments((prev) => [...prev, seg]);
          startRecording(null); // chain next segment
        } else {
          setSegments((prev) => [...prev, seg]);
          setIsRecording(false);
          setElapsed(0);
          elapsedRef.current = 0;
        }
      };

      mr.start(100);
      setIsRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      setReRecordIdx(replaceIdx);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => { const n = prev + 1; elapsedRef.current = n; return n; });
      }, 1000);
    } catch {
      // mic permission denied or unavailable
    }
  };

  // auto-stop & chain at 30 s
  useEffect(() => {
    if (!isRecording || elapsed < 30) return;
    clearInterval(timerRef.current!);
    timerRef.current = null;
    setElapsed(0);
    elapsedRef.current = 0;
    if (reRecordIdx === null) autoNextRef.current = true; // append mode → chain
    mediaRecorderRef.current?.stop();
  }, [elapsed, isRecording, reRecordIdx]);

  const stopRecording = () => {
    clearInterval(timerRef.current!);
    timerRef.current = null;
    autoNextRef.current = false;
    mediaRecorderRef.current?.stop();
  };

  const handleReRecord = (idx: number) => {
    if (isRecording) {
      // abort current recording without saving
      discardRef.current = true;
      clearInterval(timerRef.current!);
      timerRef.current = null;
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      setElapsed(0);
      elapsedRef.current = 0;
      setTimeout(() => { discardRef.current = false; startRecording(idx); }, 60);
    } else {
      startRecording(idx);
    }
  };

  // cleanup on unmount
  useEffect(() => () => {
    discardRef.current = true;
    clearInterval(timerRef.current!);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive')
      mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const reset = () => {
    discardRef.current = true;
    clearInterval(timerRef.current!);
    timerRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive')
      mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setTitle(''); setSelCategory(null); setSelTags([]);
    setCategoryInput(''); setTagInput(''); setCatOpen(false); setTagOpen(false);
    setSegments((prev) => { prev.forEach((s) => URL.revokeObjectURL(s.url)); return []; });
    setIsRecording(false); setElapsed(0); setReRecordIdx(null);
    elapsedRef.current = 0; autoNextRef.current = false; reRecordIdxRef.current = null;
  };

  const handleClose = () => { reset(); onClose(); };

  const topOffset  = isMobile ? 112 : 60;
  const panelWidth = isMobile ? '95vw' : isTablet ? '75vw' : '60vw';

  const catSuggestions = categoryInput.trim()
    ? CATEGORIES.filter((c) => c.toLowerCase().includes(categoryInput.toLowerCase()) && c !== selCategory)
    : [];
  const tagSuggestions = tagInput.trim()
    ? TAGS.filter((t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !selTags.includes(t))
    : [];

  if (!open) return null;

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
    background: 'var(--color-panel-solid)', border: '1px solid var(--gray-4)',
    borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginTop: 2,
    maxHeight: 180, overflowY: 'auto',
  };
  const dropdownItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--gray-12)',
  };
  const chipStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px',
    borderRadius: 20, border: '1px solid var(--lime-8)', background: 'var(--lime-3)',
    color: 'var(--lime-11)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  };

  return (
    <>
      <style>{`@keyframes k-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.8)}}`}</style>

      {/* Backdrop */}
      <div onClick={handleClose} style={{ position: 'fixed', top: topOffset, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', zIndex: 45 }} />

      {/* Panel */}
      <div style={{ position: 'fixed', top: topOffset, left: '50%', transform: 'translateX(-50%)', width: panelWidth, height: `calc(100vh - ${topOffset}px)`, background: 'var(--color-panel-solid)', borderTop: '1px solid var(--lime-7)', zIndex: 46, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Header */}
        <Flex justify="between" align="center" style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-4)', flexShrink: 0 }}>
          <Text size="4" weight="bold">{t('dialog.title')}</Text>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-10)', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </Flex>

        {/* Form */}
        <Flex direction="column" gap="5" style={{ padding: '24px', flex: 1 }}>

          {/* ── Title ── */}
          <Flex direction="column" gap="1">
            <Flex justify="between" align="center">
              {/* Label + mic button + recording indicator */}
              <Flex align="center" gap="2" style={{ flexWrap: 'wrap', rowGap: 4 }}>
                <Text size="2" weight="medium">{t('dialog.titleLabel')} <span style={{ color: 'var(--lime-9)' }}>*</span></Text>

                {/* Mic / Stop button */}
                <button
                  onClick={isRecording ? stopRecording : () => startRecording(null)}
                  title={isRecording ? t('dialog.stopRecording') : t('dialog.recordVoice')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isRecording ? 'var(--red-9)' : 'var(--gray-3)', color: isRecording ? '#fff' : 'var(--gray-11)', flexShrink: 0, transition: 'all .15s' }}
                >
                  {isRecording
                    ? <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1.5"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/></svg>
                  }
                </button>

                {/* Recording indicator */}
                {isRecording && (
                  <Flex align="center" gap="1">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-9)', animation: 'k-pulse 1s ease-in-out infinite', flexShrink: 0 }} />
                    <Text size="1" style={{ color: 'var(--red-11)', fontWeight: 500 }}>
                      {reRecordIdx !== null ? t('dialog.reRecording', { index: reRecordIdx + 1 }) : t('dialog.recording')}
                    </Text>
                    <Text size="1" style={{ color: 'var(--red-11)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {t('dialog.timer', { elapsed: fmtTime(elapsed) })}
                    </Text>
                  </Flex>
                )}
              </Flex>

              <Text size="1" color={title.length > 380 ? 'red' : 'gray'} style={{ flexShrink: 0 }}>{t('dialog.titleCounter', { count: title.length })}</Text>
            </Flex>
            <TextArea size="2" placeholder={t('dialog.titlePlaceholder')} value={title} maxLength={400} onChange={(e) => setTitle(e.target.value)} style={{ minHeight: 120, resize: 'vertical' }} />
          </Flex>

          {/* ── Category ── */}
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">{t('dialog.categoryLabel')}</Text>
            {selCategory && (
              <Flex gap="1" wrap="wrap">
                <button onClick={() => { setSelCategory(null); setCategoryInput(''); }} style={chipStyle}>
                  {selCategory} <Cross2Icon width={10} height={10} />
                </button>
              </Flex>
            )}
            <div style={{ position: 'relative' }}>
              <TextField.Root size="2" placeholder={selCategory ? t('dialog.categoryChangePlaceholder') : t('dialog.categoryPlaceholder')} value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setCatOpen(true); }} onFocus={() => setCatOpen(true)} onBlur={() => setTimeout(() => setCatOpen(false), 150)} />
              {catOpen && catSuggestions.length > 0 && (
                <div style={dropdownStyle}>
                  {catSuggestions.map((cat) => (
                    <button key={cat} style={dropdownItemStyle} onMouseDown={(e) => { e.preventDefault(); setSelCategory(cat); setCategoryInput(''); setCatOpen(false); }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gray-2)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>{cat}</button>
                  ))}
                </div>
              )}
            </div>
          </Flex>

          {/* ── Tags ── */}
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">{t('dialog.tagsLabel')}</Text>
            {selTags.length > 0 && (
              <Flex gap="1" wrap="wrap">
                {selTags.map((tag) => (
                  <button key={tag} onClick={() => setSelTags((prev) => prev.filter((t) => t !== tag))} style={chipStyle}>
                    #{tag} <Cross2Icon width={10} height={10} />
                  </button>
                ))}
              </Flex>
            )}
            <div style={{ position: 'relative' }}>
              <TextField.Root size="2" placeholder={t('dialog.tagsPlaceholder')} value={tagInput} onChange={(e) => { setTagInput(e.target.value); setTagOpen(true); }} onFocus={() => setTagOpen(true)} onBlur={() => setTimeout(() => setTagOpen(false), 150)} />
              {tagOpen && tagSuggestions.length > 0 && (
                <div style={dropdownStyle}>
                  {tagSuggestions.map((tag) => (
                    <button key={tag} style={dropdownItemStyle} onMouseDown={(e) => { e.preventDefault(); setSelTags((prev) => [...prev, tag]); setTagInput(''); setTagOpen(false); }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gray-2)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}># {tag}</button>
                  ))}
                </div>
              )}
            </div>
          </Flex>

          {/* ── Voice segments ── */}
          {segments.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">{t('dialog.voiceRecordings')}</Text>
              {segments.map((seg, i) => {
                const isThisReRecording = isRecording && reRecordIdx === i;
                const isOtherReRecording = isRecording && reRecordIdx !== i && reRecordIdx !== null;
                return (
                  <Flex key={seg.id} align="center" gap="2" style={{ padding: '8px 12px', border: `1px solid ${isThisReRecording ? 'var(--red-7)' : 'var(--gray-4)'}`, borderRadius: 8, background: isThisReRecording ? 'var(--red-2)' : 'var(--gray-2)' }}>
                    <Text size="1" weight="medium" color="gray" style={{ flexShrink: 0, minWidth: 68 }}>{t('dialog.segment', { index: i + 1 })}</Text>
                    <audio src={seg.url} controls style={{ flex: 1, height: 28, minWidth: 0 }} />
                    <Text size="1" color="gray" style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(seg.duration)}</Text>
                    {/* Re-record / stop button */}
                    <button
                      onClick={() => isThisReRecording ? stopRecording() : handleReRecord(i)}
                      disabled={isOtherReRecording}
                      title={isThisReRecording ? t('dialog.stopReRecording') : t('dialog.reRecordSegment')}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--gray-5)', background: isThisReRecording ? 'var(--red-9)' : 'var(--gray-1)', color: isThisReRecording ? '#fff' : 'var(--gray-10)', cursor: isOtherReRecording ? 'not-allowed' : 'pointer', opacity: isOtherReRecording ? 0.4 : 1, transition: 'all .15s' }}
                    >
                      {isThisReRecording
                        ? <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1.5"/></svg>
                        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
                      }
                    </button>
                  </Flex>
                );
              })}
            </Flex>
          )}

          {/* ── Actions ── */}
          <Flex gap="2" justify="end" style={{ marginTop: 'auto', paddingTop: 8 }}>
            <Button size="2" variant="outline" color="gray" onClick={handleClose}>{t('dialog.cancel')}</Button>
            <Button size="2" variant="solid" color="lime" disabled={!title.trim()}>{t('dialog.submit')}</Button>
          </Flex>
        </Flex>
      </div>
    </>
  );
}

// ── Search + Filter bar (shared between topbar and mobile sub-bar) ─────────────

interface SearchBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  selectedTags: string[];
  selectedCategory: string | null;
  onTagToggle: (tag: string) => void;
  onCategorySelect: (cat: string | null) => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
  onFilterClose: () => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  showPost?: boolean;
  onPostQuestion?: () => void;
}

function SearchBar({
  query, onQueryChange,
  selectedTags, selectedCategory,
  onTagToggle, onCategorySelect,
  filterOpen, onFilterToggle, onFilterClose,
  filterRef, showPost = false, onPostQuestion,
}: SearchBarProps) {
  const t = useTranslations('knowble');
  const activeFilters = selectedTags.length + (selectedCategory ? 1 : 0);

  return (
    <Flex align="center" gap="2" style={{ flex: 1 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <TextField.Root
          size="2"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{ width: '100%' }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon style={{ color: 'var(--gray-9)' }} />
          </TextField.Slot>
        </TextField.Root>
      </div>

      {/* Filter button */}
      <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={onFilterToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid',
            borderColor: activeFilters > 0 ? 'var(--lime-7)' : 'var(--gray-5)',
            background: activeFilters > 0 ? 'var(--lime-3)' : 'var(--gray-2)',
            color: activeFilters > 0 ? 'var(--lime-11)' : 'var(--gray-11)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          <MixerHorizontalIcon />
          {t('search.filters')}
          {activeFilters > 0 && (
            <span
              style={{
                background: 'var(--lime-9)',
                color: '#000',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {activeFilters}
            </span>
          )}
        </button>

        {filterOpen && (
          <FilterPopover
            selectedTags={selectedTags}
            selectedCategory={selectedCategory}
            onTagToggle={onTagToggle}
            onCategorySelect={onCategorySelect}
            onClose={onFilterClose}
          />
        )}
      </div>

      {showPost && (
        <Button size="2" variant="soft" color="lime" radius="medium" style={{ flexShrink: 0 }} onClick={onPostQuestion}>
          {t('postThought')}
        </Button>
      )}
    </Flex>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

interface TopbarProps {
  isMobile: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  selectedTags: string[];
  selectedCategory: string | null;
  onTagToggle: (tag: string) => void;
  onCategorySelect: (cat: string | null) => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
  onFilterClose: () => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  onPostQuestion: () => void;
}

function Topbar({
  isMobile,
  query, onQueryChange,
  selectedTags, selectedCategory,
  onTagToggle, onCategorySelect,
  filterOpen, onFilterToggle, onFilterClose,
  filterRef, onPostQuestion,
}: TopbarProps) {
  const t = useTranslations('knowble');
  return (
    <>
      {/* ── Main topbar ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: 'var(--color-background)',
          borderBottom: isMobile ? 'none' : '1px solid var(--lime-9)',
          gap: 12,
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <Text size="5" weight="bold" color="lime" style={{ flexShrink: 0, letterSpacing: '-0.02em' }}>
          {t('brand')}
        </Text>

        {/* Desktop: search + filter centered */}
        {!isMobile && (
          <SearchBar
            query={query} onQueryChange={onQueryChange}
            selectedTags={selectedTags} selectedCategory={selectedCategory}
            onTagToggle={onTagToggle} onCategorySelect={onCategorySelect}
            filterOpen={filterOpen} onFilterToggle={onFilterToggle} onFilterClose={onFilterClose}
            filterRef={filterRef}
          />
        )}

        {/* Auth + nav */}
        <Flex align="center" gap="2" style={{ flexShrink: 0, marginLeft: isMobile ? 'auto' : 0 }}>
          {/* Desktop: Post a question here */}
          {!isMobile && (
            <Button size="2" variant="soft" color="lime" radius="medium" onClick={onPostQuestion}>
              {t('recordMoment')}
            </Button>
          )}
          <Button size="2" variant="outline" color="gray" radius="medium">
            {t('login')}
          </Button>
          <Separator orientation="vertical" style={{ height: 20 }} />
          <Navigation />
        </Flex>
      </div>

      {/* ── Mobile sub-bar: search + filter + post ── */}
      {isMobile && (
        <div
          style={{
            position: 'sticky',
            top: 60,
            zIndex: 39,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'var(--color-background)',
            borderBottom: '1px solid var(--lime-9)',
            gap: 8,
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <SearchBar
            query={query} onQueryChange={onQueryChange}
            selectedTags={selectedTags} selectedCategory={selectedCategory}
            onTagToggle={onTagToggle} onCategorySelect={onCategorySelect}
            filterOpen={filterOpen} onFilterToggle={onFilterToggle} onFilterClose={onFilterClose}
            filterRef={filterRef}
            showPost onPostQuestion={onPostQuestion}
          />
        </div>
      )}
    </>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function KnowbleView() {
  const t = useTranslations('knowble');
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close filter when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  // Debounce search query so we don't fire on every keystroke
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ApiResponse>({
    queryKey: ['questions', debouncedQuery, selectedCategory, selectedTags],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ skip: String(pageParam), limit: String(LIMIT) });
      if (debouncedQuery) params.set('search', debouncedQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      selectedTags.forEach((t) => params.append('tags', t));
      const res = await fetch(`${KNOWBLE_URL}/thoughts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      return res.json() as Promise<ApiResponse>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.items.length;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
  });

  const questions = data?.pages.flatMap((p) => p.items.map(mapQuestion)) ?? [];

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', overflowX: 'clip' }}>
      <Topbar
        isMobile={isMobile}
        query={query}
        onQueryChange={setQuery}
        selectedTags={selectedTags}
        selectedCategory={selectedCategory}
        onTagToggle={toggleTag}
        onCategorySelect={setSelectedCategory}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen((v) => !v)}
        onFilterClose={() => setFilterOpen(false)}
        filterRef={filterRef}
        onPostQuestion={() => setPostOpen(true)}
      />
      <PostQuestionDialog
        open={postOpen}
        onClose={() => setPostOpen(false)}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 16px', boxSizing: 'border-box', width: '100%' }}>
        {/* Active filter chips */}
        {(selectedTags.length > 0 || selectedCategory) && (
          <Flex gap="1" align="center" wrap="wrap" style={{ marginBottom: 20 }}>
            {selectedCategory && (
              <Badge color="lime" variant="soft" radius="full" style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory(null)}>
                {selectedCategory} ×
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} color="lime" variant="soft" radius="full" style={{ cursor: 'pointer' }} onClick={() => toggleTag(tag)}>
                #{tag} ×
              </Badge>
            ))}
          </Flex>
        )}

        {/* States */}
        {isError && (
          <Flex direction="column" align="center" gap="2" style={{ padding: '40px 0', color: 'var(--gray-9)' }}>
            <Text size="3" color="gray">{t('feed.error')}</Text>
            <Button size="1" variant="ghost" color="gray" onClick={() => window.location.reload()}>{t('feed.retry')}</Button>
          </Flex>
        )}

        {isLoading && (
          <Flex justify="center" style={{ padding: '40px 0' }}>
            <Text size="2" color="gray">{t('feed.loading')}</Text>
          </Flex>
        )}

        {!isLoading && !isError && questions.length === 0 && (
          <Flex direction="column" align="center" gap="2" style={{ padding: '40px 0' }}>
            <MagnifyingGlassIcon width={32} height={32} style={{ color: 'var(--gray-8)' }} />
            <Text size="3" color="gray">{t('feed.empty')}</Text>
            <Button size="1" variant="ghost" color="gray" onClick={() => { setQuery(''); setSelectedTags([]); setSelectedCategory(null); }}>
              {t('feed.clearFilters')}
            </Button>
          </Flex>
        )}

        {/* Question grid — masonry */}
        {questions.length > 0 && (
          <div style={{ columns: isMobile ? 1 : isTablet ? 2 : 3, columnGap: 16 }}>
            {questions.map((q) => (
              <div key={q.id} style={{ breakInside: 'avoid', marginBottom: 16 }}>
                <QuestionCard q={q} />
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <Flex justify="center" style={{ padding: '24px 0' }}>
            <Text size="2" color="gray">{t('feed.loadingMore')}</Text>
          </Flex>
        )}

        {/* End of list */}
        {!hasNextPage && questions.length > 0 && (
          <Flex justify="center" style={{ padding: '24px 0' }}>
            <Text size="1" color="gray">{t('feed.endOfList')}</Text>
          </Flex>
        )}
      </div>
    </div>
  );
}
