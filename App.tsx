
import React, { useState, useMemo, useEffect } from 'react';
import { generateManufacturingDataset, convertToCSV } from './utils/datasetGenerator';
import { ProductionEntry, User, Toast as ToastType, DefectCategory, Shift } from './types';
import { DashboardCharts } from './components/DashboardCharts';
import { Login } from './components/Login';
import { AddEntryModal } from './components/AddEntryModal';
import { ProfileModal } from './components/ProfileModal';
import { ToastContainer } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dataset, setDataset] = useState<ProductionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductionEntry | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('All');
  const [selectedDefectFilter, setSelectedDefectFilter] = useState<string>('All');
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);

  // Date Range State
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const defaultStart = thirtyDaysAgo.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    const data = generateManufacturingDataset(1200);
    setDataset(data);
    setIsLoading(false);
  }, []);

  // Handle Theme Application
  useEffect(() => {
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.theme]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (message: string, type: ToastType['type'] = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const handleLogin = (loggedUser: User) => {
    setUser({ ...loggedUser });
    // Auto-dismiss authentication notification after 3 seconds
    addToast(`Authentication successful. Welcome, ${loggedUser.name}.`, 'success', 3000);
  };

  const handleLogout = () => {
    setUser(null);
    document.documentElement.classList.remove('dark');
    addToast('Session terminated.', 'info');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    addToast('User preferences updated successfully.', 'success');
  };

  const handleSaveEntry = (entry: ProductionEntry) => {
    if (editingEntry) {
      setDataset(prev => prev.map(d => d.batch_id === entry.batch_id ? entry : d));
      addToast(`Batch ${entry.batch_id} updated successfully.`, 'success');
    } else {
      setDataset(prev => [entry, ...prev]);
      addToast(`Batch ${entry.batch_id} logged. Database updated.`, 'success');
    }
    
    if (entry.rejection_rate_percent > 5) {
      addToast(`Quality Alert: Batch ${entry.batch_id} is above threshold!`, 'error');
    }
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = (batchId: string) => {
    setDataset(prev => prev.filter(d => d.batch_id !== batchId));
    addToast(`Batch ${batchId} removed from records.`, 'info');
  };

  const handleEditClick = (entry: ProductionEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDownload = () => {
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `manufacturing_history_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`CSV export complete for selected range.`, 'info');
  };

  const translations: any = {
    en: {
      title: "ManufacturePro", subtitle: "Quality Intelligence Hub", insights: "Process Insights", vol: "Total Volume", rej: "Rejection Total", yield: "Avg Yield Loss", defect: "Critical Defect", ledger: "Production Ledger", addBatch: "Log New Batch", reset: "Reset", monitoring: "Monitoring", searchPlaceholder: "Search by ID, Product, Op, or Machine...", batchCol: "Batch & Product", machineCol: "Machine & Op", paramCol: "Temp / Speed", qtyCol: "Qty", rejCol: "Rej %", defectCol: "Defect", actionCol: "Actions", noData: "No data in this viewport", clearFilters: "Clear all filters", paretoTitle: "Pareto Defect Analysis", correlationTitle: "Process Correlation", spcTitle: "Statistical Process Control (SPC)", certified: "Certified", rejected: "Rejected", productLabel: "Product", shiftLabel: "Shift", datasetSize: "Dataset size", activeResults: "Active results", alertsOnly: "Alerts Only", batchPerf: "Granular batch performance data", syncText: "Syncing Industrial Data...", userSettings: "User Settings", configExperience: "Configure your experience", displayName: "Display Name", roleLabel: "Role", langLabel: "Language", sysTheme: "System Theme", toggleTheme: "Toggle dark/light mode", selectAvatar: "Select Avatar", updateInfo: "Update Info", cancel: "Cancel", submit: "Submit", from: "From", to: "To", range: "Date Range",
      infPareto: "Main Issue: Machine {machine} produces major defect of type {defect}.",
      infCorr: "Observation: High temperatures (above 230°C) are causing more rejections.",
      infCorrNormal: "Observation: Process parameters are stable and within limits.",
      infSpcAlert: "Critical Alert: {count} batches have crossed the 5% quality threshold!",
      infSpcStable: "Status: Process is stable within the quality control limits."
    },
    hi: {
      title: "मैन्युफैक्चर प्रो", subtitle: "गुणवत्ता इंटेलिजेंस", insights: "प्रक्रिया अंतर्दृष्टि", vol: "कुल मात्रा", rej: "कुल अस्वीकृति", yield: "औसत उपज", defect: "महत्वपूर्ण दोष", ledger: "उत्पादन लेज़र", addBatch: "नया बैच", reset: "रीसेट", monitoring: "निगरानी", searchPlaceholder: "खोजें...", batchCol: "बैच", machineCol: "मशीन", paramCol: "तापमान", qtyCol: "मात्रा", rejCol: "अस्वीकृति %", defectCol: "दोष", actionCol: "कार्रवाई", noData: "कोई डेटा नहीं", clearFilters: "फ़िल्टर हटाएं", paretoTitle: "परेटो विश्लेषण", correlationTitle: "सहसंबंध", spcTitle: "सांख्यिकीय नियंत्रण", certified: "प्रमाणित", rejected: "अस्वीकृत", productLabel: "उत्पाद", shiftLabel: "शिफ्ट", datasetSize: "डेटा आकार", activeResults: "सक्रिय परिणाम", alertsOnly: "केवल अलर्ट", batchPerf: "बैच प्रदर्शन डेटा", syncText: "डेटा सिंक हो रहा है...", userSettings: "उपयोगकर्ता सेटिंग्स", configExperience: "अपना अनुभव कॉन्फ़िगर करें", displayName: "प्रदर्शित नाम", roleLabel: "भूमिका", langLabel: "भाषा", sysTheme: "सिस्टम थीम", toggleTheme: "डार्क/लाइट मोड", selectAvatar: "अवतार चुनें", updateInfo: "जानकारी अपडेट करें", cancel: "रद्द करें", submit: "जमा करें", from: "से", to: "तक", range: "तिथि सीमा",
      infPareto: "मुख्य समस्या: मशीन {machine} मुख्य रूप से {defect} प्रकार का दोष उत्पन्न कर रही है।",
      infCorr: "अवलोकन: उच्च तापमान (230°C से ऊपर) के कारण अधिक अस्वीकृति हो रही है।",
      infCorrNormal: "अवलोकन: प्रक्रिया पैरामीटर स्थिर और सीमा के भीतर हैं।",
      infSpcAlert: "चेतावनी: {count} बैचों ने 5% गुणवत्ता सीमा को पार कर लिया है!",
      infSpcStable: "स्थिति: प्रक्रिया गुणवत्ता नियंत्रण सीमा के भीतर स्थिर है।"
    }
  };

  const t = (key: string) => {
    const lang = user?.language || 'en';
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const filteredData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return dataset.filter(d => {
      // Date filtering
      const entryDate = d.production_date;
      const matchDate = entryDate >= startDate && entryDate <= endDate;
      
      const matchSearch = d.batch_id.toLowerCase().includes(lowerSearch) ||
                          d.machine_id.toLowerCase().includes(lowerSearch) ||
                          d.defect_category.toLowerCase().includes(lowerSearch) ||
                          d.operator.toLowerCase().includes(lowerSearch) ||
                          d.product_code.toLowerCase().includes(lowerSearch);
      const matchMachine = selectedMachineFilter === 'All' || d.machine_id === selectedMachineFilter;
      const matchDefect = selectedDefectFilter === 'All' || d.defect_category === selectedDefectFilter;
      const matchAlerts = !showOnlyAlerts || d.rejection_rate_percent > 5;
      
      return matchDate && matchSearch && matchMachine && matchDefect && matchAlerts;
    });
  }, [dataset, searchTerm, selectedMachineFilter, selectedDefectFilter, showOnlyAlerts, startDate, endDate]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { totalProd: 0, totalRej: 0, avgRate: 0, topDefect: 'N/A' };
    const totalProd = filteredData.reduce((acc, d) => acc + d.production_quantity, 0);
    const totalRej = filteredData.reduce((acc, d) => acc + d.rejected_quantity, 0);
    const avgRate = (totalRej / totalProd) * 100;
    const defectCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.defect_category !== 'None') {
        defectCounts[d.defect_category] = (defectCounts[d.defect_category] || 0) + 1;
      }
    });
    const topDefect = Object.entries(defectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    return { totalProd, totalRej, avgRate, topDefect };
  }, [filteredData]);

  const machinesList = useMemo(() => {
    const set = new Set(dataset.map(d => d.machine_id));
    return ['All', ...Array.from(set).sort()];
  }, [dataset]);

  const resetFilters = () => {
    setSelectedMachineFilter('All');
    setSelectedDefectFilter('All');
    setSearchTerm('');
    setShowOnlyAlerts(false);
    setStartDate(defaultStart);
    setEndDate(today);
    addToast('Filters reset to default view.', 'info');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium tracking-wide">{t('syncText')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <header className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-blue-900/20 group cursor-pointer transition-all hover:rotate-12">
              <i className="fa-solid fa-industry text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none">{t('title')}</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t('subtitle')}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all cursor-pointer group" onClick={() => setIsProfileModalOpen(true)}>
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                className="w-10 h-10 rounded-xl border-2 border-white dark:border-gray-800 shadow-sm object-cover transition-transform group-hover:scale-110" 
                alt="Profile"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full ring-2 ring-green-100 dark:ring-green-900/50"></div>
            </div>
            <div className="ml-3 mr-4 text-left">
              <p className="text-xs font-black text-gray-800 dark:text-white leading-none group-hover:text-blue-600 transition-colors">{user.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{user.role}</p>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mr-4"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              className="text-gray-400 hover:text-red-500 transition-colors transform hover:rotate-90 duration-300"
              title="Sign Out"
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={() => { setEditingEntry(undefined); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/20 active:scale-95 hover:shadow-xl"
            >
              <i className="fa-solid fa-plus-circle"></i>
              {t('addBatch')}
            </button>
            <button 
              onClick={handleDownload}
              className="bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 border border-transparent dark:border-gray-700"
            >
              <i className="fa-solid fa-cloud-arrow-down"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6 px-2">
           <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('insights')}</h2>
              <p className="text-sm text-gray-400 font-medium">{t('monitoring')} 
                <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">{selectedMachineFilter === 'All' ? 'All Lines' : `Line ${selectedMachineFilter}`}</span>
              </p>
           </div>
           
           <div className="flex flex-wrap items-center gap-6">
              {/* Date Range Picker */}
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col px-2">
                  <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-tighter">{t('from')}</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs font-bold bg-transparent border-none outline-none dark:text-white"
                  />
                </div>
                <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
                <div className="flex flex-col px-2">
                  <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-tighter">{t('to')}</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs font-bold bg-transparent border-none outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
                {machinesList.map(machine => (
                  <button
                    key={machine}
                    onClick={() => setSelectedMachineFilter(machine)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedMachineFilter === machine 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {machine}
                  </button>
                ))}
              </div>
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {t('reset')}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title={t('vol')} value={stats.totalProd.toLocaleString()} icon="fa-boxes-stacked" color="blue" onClick={() => setShowOnlyAlerts(false)} />
          <StatCard title={t('rej')} value={stats.totalRej.toLocaleString()} icon="fa-ban" color="red" onClick={() => setShowOnlyAlerts(true)} />
          <StatCard title={t('yield')} value={`${stats.avgRate.toFixed(2)}%`} icon="fa-chart-pie" color="amber" />
          <StatCard 
            title={t('defect')} 
            value={stats.topDefect} 
            icon="fa-triangle-exclamation" 
            color="indigo" 
            onClick={() => setSelectedDefectFilter(stats.topDefect)}
          />
        </div>

        <section className="mb-12">
          <DashboardCharts 
            data={filteredData} 
            theme={user.theme}
            selectedMachine={selectedMachineFilter}
            onDefectClick={(cat) => {
              setSelectedDefectFilter(cat);
              addToast(`Filtered by ${cat}`, 'info');
            }}
            t={t}
            labels={{
              pareto: t('paretoTitle'),
              correlation: t('correlationTitle'),
              spc: t('spcTitle')
            }}
          />
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 overflow-hidden group/table transition-colors">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('ledger')}</h2>
                <p className="text-sm text-gray-400 font-medium mt-1">{t('batchPerf')}</p>
              </div>
              {showOnlyAlerts && (
                 <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-red-200 dark:border-red-800 animate-pulse">
                   {t('alertsOnly')}
                 </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-96">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')} 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 outline-none transition-all shadow-inner dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Date & Batch</th>
                  <th className="px-8 py-5">{t('machineCol')}</th>
                  <th className="px-8 py-5 text-center">{t('paramCol')}</th>
                  <th className="px-8 py-5 text-center">{t('qtyCol')}</th>
                  <th className="px-8 py-5 text-center">{t('rejCol')}</th>
                  <th className="px-8 py-5 text-center">{t('defectCol')}</th>
                  <th className="px-8 py-5 text-right">{t('actionCol')}</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-800">
                {filteredData.slice(0, 100).map((entry) => (
                  <tr key={entry.batch_id} className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-gray-400 mb-1">{entry.production_date}</div>
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-base group-hover:translate-x-1 transition-transform">{entry.batch_id}</div>
                      <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mt-0.5 tracking-tighter">{t('productLabel')}: {entry.product_code}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-tight">{entry.machine_id}</span>
                        <span className="text-[10px] font-bold text-gray-500">{entry.operator}</span>
                      </div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entry.shift} {t('shiftLabel')}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex flex-col items-center">
                          <span className={`font-bold ${entry.temperature > 230 ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>{entry.temperature}°C</span>
                          <span className="text-[10px] text-gray-400 font-bold">{entry.speed} rpm</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-gray-900 dark:text-white">
                      {entry.production_quantity}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`font-black ${entry.rejection_rate_percent > 5 ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>
                        {entry.rejection_rate_percent}%
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {entry.defect_category === 'None' ? (
                        <span className="text-gray-300 dark:text-gray-600 font-medium">—</span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          entry.defect_category === DefectCategory.Crack ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50' :
                          entry.defect_category === DefectCategory.Misalignment ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' :
                          'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
                        }`}>
                          {entry.defect_category}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          entry.rejected_quantity === 0 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        }`}>
                          {entry.rejected_quantity === 0 ? t('certified') : t('rejected')}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditClick(entry)}
                            className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center border border-transparent dark:border-gray-700"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteEntry(entry.batch_id)}
                            className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center border border-transparent dark:border-gray-700"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <div className="py-32 text-center">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200 dark:text-gray-700 animate-bounce">
                  <i className="fa-solid fa-ghost text-5xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-400">{t('noData')}</h3>
                <button onClick={resetFilters} className="text-blue-600 font-black uppercase text-xs tracking-widest mt-4 hover:underline">{t('clearFilters')}</button>
              </div>
            )}
            
            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center flex items-center justify-between">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('datasetSize')}: {dataset.length} total</p>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('activeResults')}: {filteredData.length} in range</p>
            </div>
          </div>
        </section>
      </main>

      <AddEntryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEntry(undefined); }} 
        onAdd={handleSaveEntry}
        initialData={editingEntry}
        t={t}
      />

      <ProfileModal 
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleUpdateProfile}
        t={t}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'red' | 'amber' | 'indigo';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
  const colors = {
    blue: 'bg-blue-600 text-blue-600 ring-blue-100 dark:ring-blue-900/30',
    red: 'bg-red-600 text-red-600 ring-red-100 dark:ring-red-900/30',
    amber: 'bg-amber-600 text-amber-600 ring-amber-100 dark:ring-amber-900/30',
    indigo: 'bg-indigo-600 text-indigo-600 ring-indigo-100 dark:ring-indigo-900/30',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${onClick ? 'hover:border-blue-200 dark:hover:border-blue-800' : ''}`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:scale-110 group-hover:rotate-6 bg-opacity-10 dark:bg-opacity-20 ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">{title}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default App;
