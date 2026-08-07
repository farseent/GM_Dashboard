import { useEffect, useState } from 'react'
import { Pencil, X, Check, Loader2 } from 'lucide-react'
import Modal from '../../../components/modal/Modal'
import { getExpenseCategories, updateExpenseCategory } from '../../../api/expenseAPI'

export default function ManageCategoriesModal({ isOpen, onClose, onUpdated }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) fetchCategories()
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getExpenseCategories()
      setCategories(response.data || response)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setError('Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (cat) => {
    setEditingId(cat._id)
    setEditForm({ name: cat.name || '', description: cat.description || '' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', description: '' })
  }

  const saveEdit = async (id) => {
    if (!editForm.name.trim()) return

    try {
      setSavingId(id)
      await updateExpenseCategory(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      })

      setCategories((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, name: editForm.name.trim(), description: editForm.description.trim() } : c
        )
      )
      setEditingId(null)
      onUpdated?.() // let parent refresh its own category list/options
    } catch (err) {
      console.error('Failed to update category:', err)
      setError('Failed to save changes. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  const rowClasses = 'flex items-start justify-between gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2.5'
  const inputClasses =
    'w-full rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-sm text-fg outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-400/30'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="md">
      <div className="space-y-3">
        {error && (
          <p className="rounded-md border border-negative-100 bg-negative-50 px-3 py-2 text-xs text-negative-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-6 text-center text-sm text-fg-subtle">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-fg-subtle">No categories yet.</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat._id} className={rowClasses}>
                {editingId === cat._id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      autoFocus
                      className={inputClasses}
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Category name"
                    />
                    <input
                      className={inputClasses}
                      value={editForm.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Description (optional)"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-fg">{cat.name}</p>
                    {cat.description && (
                      <p className="mt-0.5 text-xs text-fg-subtle">{cat.description}</p>
                    )}
                  </div>
                )}

                <div className="flex shrink-0 items-center gap-1 pt-0.5">
                  {editingId === cat._id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(cat._id)}
                        disabled={savingId === cat._id}
                        className="rounded-md p-1.5 text-accent-600 transition-colors hover:bg-accent-500/10 disabled:opacity-60"
                        title="Save"
                      >
                        {savingId === cat._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingId === cat._id}
                        className="rounded-md p-1.5 text-fg-muted transition-colors hover:bg-surface"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="rounded-md p-1.5 text-fg-muted transition-colors hover:bg-surface hover:text-fg"
                      title="Edit category"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}