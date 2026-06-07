import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Typography from '@tiptap/extension-typography'
import { ArrowLeft, Download, Save, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import useMeetingStore from '../../store/meetingStore'
import EditorToolbar from '../../components/editor/EditorToolbar'
import styles from './Minutes.module.css'

// Converts the plain markdown string from backend into simple HTML for Tiptap
function markdownToHtml(md) {
  if (!md) return ''
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[a-z])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
}

export default function Minutes() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { minutes, fetchMinutes, loadingMinutes, saveAndExport, meetings } = useMeetingStore()
  const [saving, setSaving] = useState(false)

  const meeting = meetings.find((m) => m.id === meetingId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Typography,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: styles.prosemirror,
      },
    },
  })

  // Fetch minutes on mount if not already loaded
  useEffect(() => {
    if (!minutes) {
      fetchMinutes(meetingId)
    }
  }, [meetingId])

  // Populate editor when minutes arrive
  useEffect(() => {
    if (editor && minutes) {
      const html = markdownToHtml(minutes)
      editor.commands.setContent(html || minutes)
    }
  }, [editor, minutes])

  const handleSave = async () => {
    if (!editor) return
    setSaving(true)
    try {
      // Get HTML from editor, send to backend for PDF generation
      const html = editor.getHTML()
      await saveAndExport(meetingId, html)
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.error('Failed to export PDF')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Nav */}
      <header className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate(`/record/${meetingId}`)}>
          <ArrowLeft size={15} /> Back to Recording
        </button>
        <div className={styles.navCenter}>
          <Sparkles size={14} className={styles.sparkIcon} />
          <span>{meeting?.title || 'Meeting Minutes'}</span>
        </div>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || loadingMinutes}
        >
          {saving ? (
            <><span className={styles.spinner} /> Exporting…</>
          ) : (
            <><Download size={15} /> Save & Export PDF</>
          )}
        </button>
      </header>

      <main className={styles.main}>
        {loadingMinutes ? (
          <div className={styles.loading}>
            <span className={styles.spinnerLg} />
            <p>Loading minutes…</p>
          </div>
        ) : (
          <div className={styles.editorWrap}>
            <EditorToolbar editor={editor} />
            <div className={styles.editorBody}>
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
