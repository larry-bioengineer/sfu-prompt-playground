'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Cog6ToothIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ExamplePair {
  id: string
  user: string
  assistant: string
}

// Parse examples from system message
function parseExamples(systemMessage: string): ExamplePair[] {
  const examplesMatch = systemMessage.match(/<examples>(.*?)<\/examples>/s)
  if (!examplesMatch) return []
  
  const examplesContent = examplesMatch[1]
  const pairs: ExamplePair[] = []
  const userMatches = [...examplesContent.matchAll(/<user>(.*?)<\/user>/gs)]
  const assistantMatches = [...examplesContent.matchAll(/<assistant>(.*?)<\/assistant>/gs)]
  
  for (let i = 0; i < Math.max(userMatches.length, assistantMatches.length); i++) {
    pairs.push({
      id: `example-${i}-${Date.now()}`,
      user: userMatches[i]?.[1]?.trim() || '',
      assistant: assistantMatches[i]?.[1]?.trim() || '',
    })
  }
  
  return pairs.length > 0 ? pairs : []
}

// Extract base system message (without examples)
function extractBaseSystemMessage(systemMessage: string): string {
  return systemMessage.replace(/<examples>.*?<\/examples>/s, '').trim()
}

// Format examples into XML string
function formatExamples(examples: ExamplePair[]): string {
  // Only include examples that have at least a user prompt
  const validExamples = examples.filter(ex => ex.user.trim())
  if (validExamples.length === 0) return ''
  
  const examplesContent = validExamples
    .map((ex) => {
      return `<user>${ex.user.trim()}</user>\n<assistant>${ex.assistant.trim()}</assistant>`
    })
    .join('\n\n')
  
  return `<examples>\n${examplesContent}\n</examples>`
}

export default function SystemMessage({ chatId }: { chatId: string }) {
  const [open, setOpen] = useState(false)
  const [systemMessage, setSystemMessage] = useState('')
  const [examples, setExamples] = useState<ExamplePair[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load system message from API when dialog opens or chatId changes
  useEffect(() => {
    const fetchSystemMessage = async () => {
      if (!open || !chatId) {
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/system-message?chatId=${encodeURIComponent(chatId)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch system message')
        }

        const data = await response.json()
        const storedMessage = data.message || ''
        
        setSystemMessage(extractBaseSystemMessage(storedMessage))
        setExamples(parseExamples(storedMessage))
      } catch (error) {
        console.error('Error fetching system message:', error)
        setSystemMessage('')
        setExamples([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemMessage()
  }, [open, chatId])

  // Save system message to API
  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!chatId) return

    try {
      const baseMessage = systemMessage.trim()
      const examplesXml = formatExamples(examples)
      const fullMessage = examplesXml 
        ? `${baseMessage}\n\n${examplesXml}` 
        : baseMessage
      
      const response = await fetch('/api/system-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: fullMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save system message')
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('systemMessageUpdated'))
      // Close dialog after successful save
      setOpen(false)
    } catch (error) {
      console.error('Error saving system message:', error)
      alert('Failed to save system message. Please try again.')
      // Don't close dialog on error
    }
  }

  // Clear system message from API
  const handleClear = async () => {
    if (!chatId) return

    try {
      // Save empty message to clear it
      const response = await fetch('/api/system-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to clear system message')
      }

      setSystemMessage('')
      setExamples([])
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('systemMessageUpdated'))
    } catch (error) {
      console.error('Error clearing system message:', error)
      alert('Failed to clear system message. Please try again.')
    }
  }

  // Add a new example pair
  const handleAddExample = () => {
    setExamples([...examples, { id: `example-${Date.now()}`, user: '', assistant: '' }])
  }

  // Remove an example pair
  const handleRemoveExample = (id: string) => {
    setExamples(examples.filter(ex => ex.id !== id))
  }

  // Update an example pair
  const handleUpdateExample = (id: string, field: 'user' | 'assistant', value: string) => {
    setExamples(examples.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ))
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

      <Dialog open={open} onClose={(value) => setOpen(value)} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-gray-800 dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10 max-h-[90vh] overflow-y-auto"
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
                    System Message & Few-Shot Examples
                  </DialogTitle>
                  <div className="mt-4 text-left">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
                        System Message
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-left">
                        Configure a system message that will be used to guide the AI's behavior.
                      </p>
                      <Textarea
                        value={systemMessage}
                        onChange={(e) => setSystemMessage(e.target.value)}
                        placeholder="Enter your system message here..."
                        className="min-h-48 resize-y"
                      />
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                            Few-Shot Examples
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                            Add example conversations to teach the AI how to respond. Each example includes a user prompt and the desired assistant response.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddExample}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 shrink-0"
                        >
                          <PlusIcon className="size-4" />
                          Add Example
                        </Button>
                      </div>

                      {examples.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            No examples yet. Click "Add Example" to create your first few-shot example.
                          </p>
                          <Button
                            type="button"
                            onClick={handleAddExample}
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                          >
                            <PlusIcon className="size-4" />
                            Add Example
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {examples.map((example, index) => (
                            <div
                              key={example.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Example {index + 1}
                                </span>
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveExample(example.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <TrashIcon className="size-4" />
                                  Remove
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    User Prompt
                                  </label>
                                  <Textarea
                                    value={example.user}
                                    onChange={(e) => handleUpdateExample(example.id, 'user', e.target.value)}
                                    placeholder="Enter the user's prompt or question..."
                                    className="min-h-20 resize-y text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Assistant Response
                                  </label>
                                  <Textarea
                                    value={example.assistant}
                                    onChange={(e) => handleUpdateExample(example.id, 'assistant', e.target.value)}
                                    placeholder="Enter the desired assistant response..."
                                    className="min-h-20 resize-y text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                  onClick={(e) => {
                    e.preventDefault()
                    handleSave(e)
                  }}
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

