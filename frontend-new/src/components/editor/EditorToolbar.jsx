import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Highlighter, Table,
} from 'lucide-react'
import styles from './EditorToolbar.module.css'

function ToolBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.active : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className={styles.sep} />
}

export default function EditorToolbar({ editor }) {
  if (!editor) return null

  return (
    <div className={styles.toolbar}>
      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo size={15} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo size={15} />
      </ToolBtn>

      <Sep />

      {/* Headings */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      ><Heading1 size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      ><Heading2 size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      ><Heading3 size={15} /></ToolBtn>

      <Sep />

      {/* Inline */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')} title="Bold"
      ><Bold size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')} title="Italic"
      ><Italic size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')} title="Underline"
      ><Underline size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')} title="Strikethrough"
      ><Strikethrough size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')} title="Highlight"
      ><Highlighter size={15} /></ToolBtn>

      <Sep />

      {/* Lists */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')} title="Bullet List"
      ><List size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')} title="Ordered List"
      ><ListOrdered size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')} title="Blockquote"
      ><Quote size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      ><Minus size={15} /></ToolBtn>

      <Sep />

      {/* Alignment */}
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })} title="Align Left"
      ><AlignLeft size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })} title="Align Center"
      ><AlignCenter size={15} /></ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })} title="Align Right"
      ><AlignRight size={15} /></ToolBtn>

      <Sep />

      {/* Table */}
      <ToolBtn
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      ><Table size={15} /></ToolBtn>
    </div>
  )
}
