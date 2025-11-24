'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'system-message'

export default function SystemMessage() {
  const [open, setOpen] = useState(false)
  const [systemMessage, setSystemMessage] = useState('')

  // Load system message from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSystemMessage(stored)
      }
    }
  }, [])

  // Save system message to localStorage
  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, systemMessage)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('systemMessageUpdated'))
      setOpen(false)
    }
  }

  // Clear system message from localStorage
  const handleClear = () => {
    setSystemMessage('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('systemMessageUpdated'))
    }
  }

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Cog6ToothIcon className="size-4" />
        System Message
      </Button>

      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-gray-800 dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10"
            >
              <div>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                  <Cog6ToothIcon
                    aria-hidden="true"
                    className="size-6 text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900 dark:text-white"
                  >
                    System Message
                  </DialogTitle>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Configure a system message that will be used to guide the AI's behavior. This will be saved to your device's local storage.
                    </p>
                    <Textarea
                      value={systemMessage}
                      onChange={(e) => setSystemMessage(e.target.value)}
                      placeholder="Enter your system message here..."
                      className="min-h-80 resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex gap-3">
                <Button
                  type="button"
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  Save
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

