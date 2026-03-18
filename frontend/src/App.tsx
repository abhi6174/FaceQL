import { useState } from 'react';
import axios from 'axios';
import { Upload, Search, Image as ImageIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState<'index' | 'search'>('index');
  const [eventId, setEventId] = useState('wedding-2024');
  
  // Indexing State
  const [indexFiles, setIndexFiles] = useState<FileList | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexResults, setIndexResults] = useState<{name: string, status: 'success'|'error', msg: string}[]>([]);

  // Searching State
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexFiles || indexFiles.length === 0) return;

    setIsIndexing(true);
    setIndexResults([]);
    
    for (let i = 0; i < indexFiles.length; i++) {
      const file = indexFiles[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('event_id', eventId);

      try {
        const res = await axios.post(`${API_URL}/index-photo`, formData);
        setIndexResults(prev => [...prev, { name: file.name, status: 'success', msg: res.data.message }]);
      } catch (err: any) {
        setIndexResults(prev => [...prev, { name: file.name, status: 'error', msg: err?.response?.data?.detail || err.message }]);
      }
    }
    
    setIsIndexing(false);
    setIndexFiles(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFile) return;

    setIsSearching(true);
    const formData = new FormData();
    formData.append('file', searchFile);
    formData.append('event_id', eventId);

    try {
      const res = await axios.post(`${API_URL}/search-face`, formData);
      setSearchResults(res.data.search_results);
    } catch (err) {
      console.error(err);
      alert("Search failed. See console.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Premium Dark Header */}
      <header className="bg-neutral-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <ImageIcon size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Face<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">QL</span>
            </h1>
          </div>
          
          <div className="flex bg-neutral-900/80 p-1.5 rounded-xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setActiveTab('index')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'index' ? 'bg-indigo-500/10 text-indigo-400 shadow-sm border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}
            >
               <Upload size={16} /> Bulk Upload
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'search' ? 'bg-purple-500/10 text-purple-400 shadow-sm border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}
            >
               <Search size={16} /> Find Faces
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Global Event Setup */}
        <div className="mb-10 bg-neutral-900 border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-l-indigo-500">
          <div>
            <h3 className="text-white font-semibold">Active Event Scope</h3>
            <p className="text-slate-400 text-sm mt-1">Photos and searches will be isolated to this event ID.</p>
          </div>
          <div className="sm:ml-auto w-full sm:w-72">
            <input 
              type="text" 
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              placeholder="e.g. conference-2024"
              className="w-full bg-neutral-950 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono text-sm transition-all shadow-inner"
            />
          </div>
        </div>

        {/* --- INDEXING VIEW --- */}
        <div className={`transition-all duration-500 transform ${activeTab === 'index' ? 'translate-y-0 opacity-100 flex flex-col' : 'hidden'}`}>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-12 items-start">
              <div className="flex-1 w-full space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Build Your Dataset</h2>
                  <p className="text-slate-400 leading-relaxed">Select hundreds of photos at once. Celeb-level embeddings are extracted incredibly fast by the background workers.</p>
                </div>

                <form onSubmit={handleBulkUpload} className="space-y-6">
                  {/* File Dropzone */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-neutral-950 border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center cursor-pointer transition-colors hover:bg-neutral-900 overflow-hidden">
                      <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Choose Photos</h4>
                      <p className="text-slate-400 text-sm max-w-xs">Drag and drop, or click to browse. Supports JPG, PNG.</p>
                      
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => setIndexFiles(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {indexFiles && indexFiles.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <span className="text-indigo-200 font-medium">{indexFiles.length} files queued for upload</span>
                      <button 
                        type="button" 
                        onClick={() => setIndexFiles(null)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                         <XCircle size={20} />
                      </button>
                    </div>
                  )}

                  <button 
                    disabled={isIndexing || !indexFiles || indexFiles.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25"
                  >
                    {isIndexing ? (
                      <><Loader2 className="animate-spin w-5 h-5" /> Processing via Celery...</>
                    ) : (
                      <><Upload className="w-5 h-5" /> Start Indexing Process</>
                    )}
                  </button>
                </form>
              </div>

              {/* Upload Live Log Area */}
              <div className="w-full sm:w-80 bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[420px]">
                <div className="bg-neutral-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Activity Log</span>
                  {isIndexing && <span className="flex w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-3">
                  {indexResults.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                      <span className="block mb-2">⏱️</span> Waiting for activity...
                    </div>
                  ) : (
                    indexResults.map((log, i) => (
                      <div key={i} className="flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mt-0.5">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${log.status === 'success' ? 'text-slate-300' : 'text-rose-300'}`}>{log.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{log.msg}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SEARCH VIEW --- */}
        <div className={`transition-all duration-500 transform ${activeTab === 'search' ? 'translate-y-0 opacity-100 flex flex-col' : 'hidden'}`}>
          <div className="bg-neutral-900 border border-white/5 rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden mb-8">
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

            <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-3">AI Face Search</h2>
              <p className="text-slate-400">Upload a single photo of a person to find all occurrences of them in the selected dataset instantly.</p>
            </div>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-6 relative z-10">
              <div className="bg-neutral-950 border border-white/10 rounded-2xl flex items-center p-2 shadow-inner focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
                 <div className="p-3 bg-neutral-900 rounded-xl border border-white/5 text-slate-400">
                   <ImageIcon className="w-6 h-6" />
                 </div>
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={(e) => setSearchFile(e.target.files ? e.target.files[0] : null)}
                   className="flex-1 w-full pl-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer focus:outline-none"
                 />
              </div>

              <button 
                disabled={isSearching || !searchFile}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25"
              >
                {isSearching ? (
                  <><Loader2 className="animate-spin w-5 h-5" /> querying vector space...</>
                ) : (
                  <><Search className="w-5 h-5" /> Run Facial Recognition</>
                )}
              </button>
            </form>
          </div>

          {/* Render Output Images */}
          {searchResults.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  Match Results
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">{searchResults.length} Found</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result, i) => (
                  <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 group flex flex-col">
                    <div className="aspect-square w-full bg-neutral-950 relative overflow-hidden">
                      {/* Photo from S3 */}
                      <img 
                        src={result.image_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        alt={`Match ${i}`}
                        onError={(e: any) => {
                          const fallbackSrc = 'https://placehold.co/600x400?text=Image+Unavailable';
                          if (e.target.src !== fallbackSrc) {
                            e.target.src = fallbackSrc;
                          }
                        }}
                      />
                      {/* Subdued overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60"></div>
                      
                      {/* Meta badge */}
                      <div className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur border border-white/10 text-slate-300 text-xs px-2.5 py-1 rounded-md font-mono font-medium shadow-sm">
                        ID: {result.embedding_id}
                      </div>

                      {/* We could potentially draw the bounding box here if we did some math, but we'll leave it simple for now */}
                    </div>
                    
                    <div className="p-5 border-t border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                        <h4 className="font-semibold text-slate-200">Face Match Detected</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate bg-neutral-950 p-2 rounded-lg border border-white/5">
                        bbox: {JSON.stringify(result.bbox)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State after Search */}
          {searchResults.length === 0 && searchFile && !isSearching && (
            <div className="text-center p-12 bg-neutral-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Matches Found</h3>
              <p className="text-slate-400 max-w-sm">
                We couldn't find any mathematically close embeddings for this face in event "{eventId}".
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
