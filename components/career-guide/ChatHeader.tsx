interface Props{
    currentQuestionNumber:number;
    progress:number;
}

export default function ChatHeader({currentQuestionNumber,progress}:Props) {
    return (
          <header className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CareerPath AI</h1>
                <p className="text-sm text-blue-100/80 font-medium">Intelligent Career Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse absolute inset-0 opacity-50"></div>
              </div>
              <span className="text-sm font-medium text-white">Live Assessment</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">Progress</span>
              <span className="text-white font-semibold">{currentQuestionNumber}/17 • {progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </header>
    )
}