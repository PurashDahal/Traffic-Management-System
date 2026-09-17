import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AIAnalysisModal from '../../components/AIAnalysisModal';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, Upload, Car, MapPin, FileCheck, CheckCircle2, AlertCircle, Bot } from 'lucide-react';

const CreateViolationPage = () => {
  const locationState = useLocation().state;
  const navigate = useNavigate();

  const [violationTypes, setViolationTypes] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState(locationState?.vehicleNumber || '');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [location, setLocation] = useState('Main Road Intersection, Kathmandu');
  const [officerNotes, setOfficerNotes] = useState('');
  const [customFine, setCustomFine] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);

  // AI states
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiStatus, setAiStatus] = useState('NONE');
  const [aiRawText, setAiRawText] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalContent, setAiModalContent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  useEffect(() => {
    api.get('/violation-types')
      .then(res => {
        setViolationTypes(res.data);
        if (res.data.length > 0) {
          setSelectedTypeId(res.data[0].id.toString());
          setCustomFine(res.data[0].defaultFineAmount.toString());
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleTypeChange = (idStr) => {
    setSelectedTypeId(idStr);
    const selected = violationTypes.find(t => t.id.toString() === idStr);
    if (selected) {
      setCustomFine(selected.defaultFineAmount.toString());
    }
  };

  const handleEvidenceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenceFile(file);
      setEvidencePreview(URL.createObjectURL(file));
    }
  };

  // AI Feature 1: Classify Violation from text description
  const handleAiClassify = async () => {
    if (!officerNotes.trim()) {
      setError('Please enter a description note for AI to analyze.');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/classify-violation', { description: officerNotes });
      setAiModalContent(res.data);
      setShowAiModal(true);
    } catch (err) {
      setError('Failed to contact AI classification service.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature 2: Analyze Evidence Image
  const handleAiAnalyzeImage = async () => {
    if (!evidenceFile) {
      setError('Please select an evidence photo to analyze.');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const res = await api.post(`/ai/analyze-evidence?filename=${encodeURIComponent(evidenceFile.name)}`);
      setAiModalContent(res.data);
      setShowAiModal(true);
    } catch (err) {
      setError('Failed to analyze image evidence with AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature 3: Generate Violation Description
  const handleAiGenerateDescription = async () => {
    const selected = violationTypes.find(t => t.id.toString() === selectedTypeId);

    setAiLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/generate-description', {
        violationType: selected ? selected.categoryName : 'Traffic Violation',
        vehicleNumber: vehicleNumber || 'Vehicle',
        location: location,
        additionalDetails: officerNotes
      });

      setOfficerNotes(res.data.generatedDescription);
      setAiStatus('EDITED');
      setAiRawText(`AI Generated Description: ${res.data.generatedDescription}`);
    } catch (err) {
      setError('Failed to generate description with AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAiSuggestion = (suggestion) => {
    if (suggestion.suggestedViolation) {
      const matched = violationTypes.find(t => t.categoryName.toLowerCase() === suggestion.suggestedViolation.toLowerCase());
      if (matched) {
        setSelectedTypeId(matched.id.toString());
        setCustomFine(matched.defaultFineAmount.toString());
      }
      setAiStatus('ACCEPTED');
      setAiRawText(`Accepted AI Suggestion: ${suggestion.suggestedViolation} (Severity: ${suggestion.suggestedSeverity}). Reason: ${suggestion.reason}`);
    }
  };

  const handleEditAiSuggestion = (editedText) => {
    setOfficerNotes(editedText);
    setAiStatus('EDITED');
    setAiRawText(`Edited AI Suggestion: ${editedText}`);
  };

  const handleRejectAiSuggestion = () => {
    setAiStatus('REJECTED');
    setAiRawText('Rejected AI Suggestion by Officer decision.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const dto = {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        violationTypeId: parseInt(selectedTypeId),
        location: location.trim(),
        officerNotes: officerNotes.trim(),
        customFineAmount: parseFloat(customFine),
        aiSuggestionRaw: aiRawText,
        aiStatus: aiStatus
      };

      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      if (evidenceFile) {
        formData.append('evidence', evidenceFile);
      }

      const res = await api.post('/violations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCreatedTicket(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue violation ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdTicket) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Digital Ticket {createdTicket.ticketNumber} Issued Successfully & Owner Notified!</span>
          </div>
          <button
            onClick={() => { setCreatedTicket(null); setVehicleNumber(''); }}
            className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
          >
            Issue Another Ticket
          </button>
        </div>

        <DigitalTicketCard ticket={createdTicket} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-rose-600" /> Issue Digital Violation Ticket
        </h1>
        <p className="text-xs text-slate-500">Record traffic violation details with optional AI classification assistance</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Ticket Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Number *</label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. BA 12 PA 3456"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Main Road Intersection"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Violation Category *</label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white font-semibold"
                >
                  {violationTypes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.categoryName} (Fine: Rs. {t.defaultFineAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Fine Amount (Rs.) *</label>
                <input
                  type="number"
                  required
                  value={customFine}
                  onChange={(e) => setCustomFine(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700 font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700 uppercase">Violation Description & Notes</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAiClassify}
                    disabled={aiLoading}
                    className="text-[11px] bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> AI Classify Text
                  </button>
                  <button
                    type="button"
                    onClick={handleAiGenerateDescription}
                    disabled={aiLoading}
                    className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1"
                  >
                    <Bot className="w-3 h-3 text-indigo-600" /> AI Generate Description
                  </button>
                </div>
              </div>
              <textarea
                rows="3"
                placeholder="Enter description note or click AI buttons above..."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs"
              />
            </div>

            {/* Evidence Image Upload & AI Analysis Button */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700 uppercase">Attach Evidence Photo (Optional)</label>
                {evidenceFile && (
                  <button
                    type="button"
                    onClick={handleAiAnalyzeImage}
                    disabled={aiLoading}
                    className="text-[11px] bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" /> AI Analyze Image Evidence
                  </button>
                )}
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors relative bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {evidencePreview ? (
                  <div>
                    <img src={evidencePreview} alt="Evidence Preview" className="h-32 object-contain mx-auto rounded-lg mb-2" />
                    <span className="text-xs text-slate-700 font-semibold">{evidenceFile?.name}</span>
                  </div>
                ) : (
                  <div className="text-slate-500">
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Upload Violation Photograph</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG, JPEG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Status Badge if used */}
            {aiStatus !== 'NONE' && (
              <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-xl text-xs flex items-center justify-between">
                <span className="font-semibold">AI Assist Status: <strong>{aiStatus}</strong></span>
                <span className="text-[10px] text-sky-600 truncate max-w-xs">{aiRawText}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {submitting ? 'Issuing Ticket...' : 'Confirm & Issue Digital Ticket'}
            </button>
          </form>
        </div>

        {/* Info & Legal Guidelines Sidebar */}
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-2 text-xs">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" /> AI Assist Protocol
            </h4>
            <p className="leading-relaxed text-amber-900/90">
              AI provides assistive violation classification, image detection, and description generation to speed up ticketing.
            </p>
            <p className="font-semibold text-amber-950 border-t border-amber-200/80 pt-2 mt-2">
              AI suggestions must never issue fines automatically without manual Officer review and confirmation.
            </p>
          </div>
        </div>
      </div>

      <AIAnalysisModal
        suggestion={aiModalContent}
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onAccept={handleAcceptAiSuggestion}
        onEdit={handleEditAiSuggestion}
        onReject={handleRejectAiSuggestion}
      />
    </div>
  );
};

export default CreateViolationPage;
