import { useEffect, useState } from 'react'
import Modal from '../../../components/modal/Modal'
import { getExpenseLocations } from '../../../api/expenses'

const LOCATION_MODELS = ['Branch', 'Franchise']
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Yearly']

const initialForm = {
  expenseName: '',
  locationModel: 'Branch',
  branchOrFranchise: '',
  category: '',
  frequency: 'Monthly',
  amount: '',
  notes: '',
}

export default function AddExpenseModal({ isOpen, onClose, onSubmit, categories = [] }) {
  const [form, setForm] = useState(initialForm)
  const [locations, setLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm)
      setErrors({})
      setSubmitError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true)
        const data = await getExpenseLocations(form.locationModel)
        if (!cancelled) setLocations(Array.isArray(data) ? data : data?.data || [])
      } catch (err) {
        console.error('Failed to fetch locations:', err)
        if (!cancelled) setLocations([])
      } finally {
        if (!cancelled) setLoadingLocations(false)
      }
    }

    fetchLocations()
    return () => { cancelled = true }
  }, [isOpen, form.locationModel])

  const handleChange = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'locationModel' ? { branchOrFranchise: '' } : {}),
    }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.expenseName.trim()) next.expenseName = 'Expense name is required'
    if (!form.branchOrFranchise) next.branchOrFranchise = `Select a ${form.locationModel.toLowerCase()}`
    if (!form.category) next.category = 'Select a category'
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Enter a valid amount'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    const payload = {
      expenseName: form.expenseName.trim(),
      branchOrFranchise: form.branchOrFranchise,
      locationModel: form.locationModel,
      category: form.category,
      frequency: form.frequency,
      amount: Number(form.amount),
      notes: form.notes.trim(),
    }

    try {
      setIsSubmitting(true)
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to create expense. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses =
    'w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent-500 focus:ring-2 focus:ring-accent-400/30'
  const labelClasses = 'mb-1 block text-xs font-medium text-fg-muted'
  const errorClasses = 'mt-1 text-xs text-negative-500'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses} htmlFor="expenseName">Expense Name</label>
          <input
            id="expenseName"
            type="text"
            className={inputClasses}
            placeholder="e.g. Office rent"
            value={form.expenseName}
            onChange={handleChange('expenseName')}
          />
          {errors.expenseName && <p className={errorClasses}>{errors.expenseName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses} htmlFor="locationModel">Location Type</label>
            <select
              id="locationModel"
              className={inputClasses}
              value={form.locationModel}
              onChange={handleChange('locationModel')}
            >
              {LOCATION_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClasses} htmlFor="branchOrFranchise">{form.locationModel}</label>
            <select
              id="branchOrFranchise"
              className={inputClasses}
              value={form.branchOrFranchise}
              onChange={handleChange('branchOrFranchise')}
              disabled={loadingLocations}
            >
              <option value="">
                {loadingLocations ? 'Loading...' : `Select ${form.locationModel.toLowerCase()}`}
              </option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
            {errors.branchOrFranchise && <p className={errorClasses}>{errors.branchOrFranchise}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses} htmlFor="category">Category</label>
            <select
              id="category"
              className={inputClasses}
              value={form.category}
              onChange={handleChange('category')}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className={errorClasses}>{errors.category}</p>}
          </div>

          <div>
            <label className={labelClasses} htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              className={inputClasses}
              value={form.frequency}
              onChange={handleChange('frequency')}
            >
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses} htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            className={inputClasses}
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange('amount')}
          />
          {errors.amount && <p className={errorClasses}>{errors.amount}</p>}
        </div>

        <div>
          <label className={labelClasses} htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={3}
            className={inputClasses}
            placeholder="Optional notes"
            value={form.notes}
            onChange={handleChange('notes')}
          />
        </div>

        {submitError && (
          <p className="rounded-md border border-negative-100 bg-negative-50 px-3 py-2 text-xs text-negative-600">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}