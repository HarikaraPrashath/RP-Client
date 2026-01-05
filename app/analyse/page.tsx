"use client"

import { Button, Form, Input, message } from "antd"
import Link from "next/link"
import { useEffect, useState } from "react"
import { authHeader } from "../../lib/auth"

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type AnalysisResponse = Record<string, unknown>
type JobMatch = {
  ref?: string
  position?: string
  employer?: string
  url?: string
  match_percentage?: number
  matched_skills?: string[]
  missing_skills?: string[]
  total_required?: number
}

export default function AnalysePage() {
  const [api, contextHolder] = message.useMessage()
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    let ignore = false
    const loadProfilePosition = async () => {
      try {
        const res = await fetch(`${apiBase}/profile`, {
          cache: "no-store",
          headers: authHeader(),
        })
        if (!res.ok) return
        const profile = await res.json()
        const position =
          typeof profile?.basics?.position === "string" ? profile.basics.position.trim() : ""
        if (!ignore && position) {
          const currentValue = form.getFieldValue("keyword")
          if (!currentValue) {
            form.setFieldsValue({ keyword: position })
          }
        }
      } catch {
        // Ignore profile load errors; keyword is optional.
      }
    }

    loadProfilePosition()
    return () => {
      ignore = true
    }
  }, [form])

  const onFinish = async (values: { keyword: string }) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${apiBase}/analyse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const error = await res.json()
        api.error(error.detail || "Request failed")
        return
      }

      const data = (await res.json()) as AnalysisResponse
      setResult(data)
      api.success("Analysis completed")
    } catch (error) {
      api.error("Unable to reach the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900/40 px-6 py-12">
      {contextHolder}
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">Job Analysis</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Analyze a keyword</h1>
          <p className="mt-2 text-sm text-slate-300">
            Enter a role keyword or leave it blank to use your profile position. This can take a few minutes.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="text-left">
            <Form.Item
              label={<span className="text-slate-200">Keyword</span>}
              name="keyword"
            >
              <Input placeholder="software engineer (optional)" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-emerald-400 text-slate-950">
              Run analysis
            </Button>
          </Form>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Output</h2>
            <Link href="/" className="text-sm text-emerald-200 underline underline-offset-4">
              Back to home
            </Link>
          </div>
          {result ? (
            <div className="mt-4 grid gap-6">
              {(() => {
                const gap = result.gap_analysis as Record<string, unknown> | undefined
                const matches = (gap?.job_matches as JobMatch[] | undefined) || []
                const anySkills = matches.some((job) => (job.total_required || 0) > 0)
                if (anySkills) {
                  return null
                }
                return (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
                    <p className="text-sm font-semibold">No skills extracted yet</p>
                    <p className="mt-2 text-sm text-amber-100/80">
                      The listings are image-based. Install Tesseract OCR and rerun to extract text from the ads.
                    </p>
                  </div>
                )
              })()}

              <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  {(() => {
                    const gap = result.gap_analysis as Record<string, unknown> | undefined
                    const summary = gap?.readiness_summary as Record<string, number> | undefined
                    return (
                      <div className="grid gap-4 md:grid-cols-3">
                        {[
                          {
                            label: "Jobs analyzed",
                            value: gap?.total_jobs_analyzed ?? 0,
                            hint: "Total listings",
                          },
                          {
                            label: "Average match",
                            value: `${summary?.average_match ?? 0}%`,
                            hint: "Across all roles",
                          },
                          {
                            label: "High matches",
                            value: summary?.highly_qualified ?? 0,
                            hint: "70%+ match",
                          },
                        ].map((card) => (
                          <div key={card.label} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">{card.label}</p>
                            <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                            <p className="text-xs text-slate-400">{card.hint}</p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {(() => {
                    const predictions = result.predictions as Record<string, unknown> | undefined
                    const recommendations = (predictions?.recommendations as string[] | undefined) || []
                    if (!recommendations.length) {
                      return null
                    }
                    return (
                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Recommendations</p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-200">
                          {recommendations.slice(0, 4).map((rec) => (
                            <div key={rec} className="rounded-xl bg-white/5 px-3 py-2">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {(() => {
                  const gap = result.gap_analysis as Record<string, unknown> | undefined
                  const topMissing = (gap?.top_missing_skills as Array<Record<string, unknown>> | undefined) || []
                  return (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Skill gaps</p>
                      <h3 className="mt-3 text-lg font-semibold text-white">Top missing skills</h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {topMissing.length ? (
                          topMissing.slice(0, 10).map((item) => (
                            <span
                              key={String(item.skill)}
                              className="rounded-full border border-emerald-200/30 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100"
                            >
                              {String(item.skill)} ({String(item.frequency)})
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400">No gaps detected yet.</p>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {(() => {
                const gap = result.gap_analysis as Record<string, unknown> | undefined
                const matches = (gap?.job_matches as JobMatch[] | undefined) || []
                if (!matches.length) {
                  return null
                }
                return (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Top matches</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {matches.slice(0, 6).map((job) => (
                        <div key={String(job.ref)} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{job.position}</p>
                              <p className="text-xs text-slate-400">{job.employer}</p>
                            </div>
                            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                              {job.match_percentage ?? 0}% match
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(job.matched_skills || []).slice(0, 4).map((skill) => (
                              <span
                                key={`${job.ref}-${skill}`}
                                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          {job.url ? (
                            <a
                              className="mt-3 inline-flex text-xs text-emerald-200 underline underline-offset-4"
                              href={job.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View listing
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {(() => {
                const predictions = result.predictions as Record<string, unknown> | undefined
                const timeline =
                  (predictions?.career_timeline as Record<string, Record<string, unknown>> | undefined) || {}
                const entries = Object.entries(timeline)
                if (!entries.length) {
                  return null
                }
                return (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Roadmap</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">Career timeline</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {entries.map(([key, data]) => (
                        <div key={key} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                            {key.replace("_", " ")}
                          </p>
                          <p className="mt-2 text-sm text-slate-200">{String(data.focus)}</p>
                          <p className="mt-2 text-xs text-slate-400">
                            Opportunities: {String(data.opportunities)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-emerald-100">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Raw JSON</p>
                <pre className="mt-3 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-400">
              Submit a keyword to see the response.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
