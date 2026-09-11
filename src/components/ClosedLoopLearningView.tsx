import React, { useState } from 'react';
import {
  RefreshCw,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { ClosedLoopFeedbackRecord } from '../types';
import { initialClosedLoopRecords } from '../data/nerData';

interface ClosedLoopLearningViewProps {
  records?: ClosedLoopFeedbackRecord[];
}

export const ClosedLoopLearningView: React.FC<ClosedLoopLearningViewProps> = ({
  records = initialClosedLoopRecords,
}) => {
  const [feedbackList, setFeedbackList] = useState<ClosedLoopFeedbackRecord[]>(records);
  const [isSubmittingNew, setIsSubmittingNew] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  // Form State
  const [locationName, setLocationName] = useState('Dima Hasao KM 142');
  const [eventOccurred, setEventOccurred] = useState<boolean>(true);
  const [observedVolume, setObservedVolume] = useState('1,850 m³ Disang shale and colluvium slide block');
  const [geologistNotes, setGeologistNotes] = useState('Wedge failure along shale bedding plane triggered by 160mm 24h rainfall.');

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ClosedLoopFeedbackRecord = {
      id: `clf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      locationId: 'loc-assam-dima-hasao',
      locationName,
      alertCode: `ALERT-RED-${Date.now().toString().slice(-4)}`,
      predictedRiskScore: 84,
      predictedLevel: 'CRITICAL',
      issuedAt: new Date(Date.now() - 3600000).toISOString(),
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'Dr. T. Sharma (Senior Geologist, GSI NER)',
      officerRole: 'State Geotechnical Officer',
      actualEventOccurred: eventOccurred,
      observedDebrisVolume: observedVolume,
      geotechnicalValidationNotes: geologistNotes,
      recalibrationFeedbackWeight: 1.0,
      status: 'MODEL_UPDATED',
    };

    setFeedbackList([newRecord, ...feedbackList]);
    setIsSubmittingNew(false);
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/40">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Closed-Loop Learning & Ground Truth Recalibration
                <span className="text-xs bg-pink-950 text-pink-300 font-mono px-2 py-0.5 rounded border border-pink-800">
                  Human-in-the-Loop
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transforms every verified landslide or near-miss into retraining data to continuously calibrate geotechnical failure thresholds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSubmittingNew(!isSubmittingNew)}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isSubmittingNew ? 'Cancel Verification' : 'Log Ground Truth Audit'}</span>
          </button>
        </div>
      </div>

      {/* Multimodal Citizen Verification Architecture Card */}
      <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            Multimodal Citizen Incident Verification Pipeline
          </span>
          <span className="text-xs bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
            Anti-Spam & Cross-Correlation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">1. Citizen Photo & GPS</strong>
            <span className="text-[11px] text-slate-400">EXIF geo-tag + timestamp validation prevents recycled web images.</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">2. Live Doppler Weather</strong>
            <span className="text-[11px] text-slate-400">Verifies whether severe localized rainfall actually occurred at coordinate.</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">3. Nearby Sensor Cross-Check</strong>
            <span className="text-[11px] text-slate-400">Confirms whether soil moisture & tilt sensors in 5km radius registered spike.</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-slate-200 block">4. AI Image Segmentation</strong>
            <span className="text-[11px] text-emerald-400">89% Crack & Scarp confidence ➔ Incident Flagged HIGH CONFIDENCE.</span>
          </div>
        </div>
      </div>

      {/* Closed-Loop Learning Process Flow */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Continuous Retraining Feedback Loop:
        </span>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-center">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
            <span className="text-cyan-400 block font-bold">1. Prediction</span>
            <span className="text-[10px] text-slate-400">Risk Score 88%</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
            <span className="text-amber-400 block font-bold">2. CAP Alert</span>
            <span className="text-[10px] text-slate-400">Evacuation Dispatched</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
            <span className="text-emerald-400 block font-bold">3. Field Recon</span>
            <span className="text-[10px] text-slate-400">GSI Ground Survey</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
            <span className="text-purple-400 block font-bold">4. Ground Truth</span>
            <span className="text-[10px] text-slate-400">Actual Slip Recorded</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
            <span className="text-pink-400 block font-bold">5. Recalibration</span>
            <span className="text-[10px] text-emerald-300">+2.8% F1 Accuracy</span>
          </div>
        </div>
      </div>

      {submissionSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600/70 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Ground truth audit successfully ingested. Bayesian model calibration updated for sector.</span>
        </div>
      )}

      {/* New Ground Truth Form */}
      {isSubmittingNew && (
        <form onSubmit={handleAddFeedback} className="p-5 bg-slate-850 rounded-2xl border border-pink-500/40 space-y-4 text-xs">
          <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-pink-400" />
            Field Officer Ground Truth Verification Form
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Slope Sector / Location:</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Actual Event Outcome:</label>
              <select
                value={eventOccurred ? 'YES' : 'NO'}
                onChange={(e) => setEventOccurred(e.target.value === 'YES')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              >
                <option value="YES">YES - Landslide Event Occurred</option>
                <option value="NO">NO - False Alarm / No Slip</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-bold">Observed Debris Volume & Characteristics:</label>
              <input
                type="text"
                value={observedVolume}
                onChange={(e) => setObservedVolume(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Geotechnical Field Notes & Recalibration Insight:</label>
            <textarea
              rows={2}
              value={geologistNotes}
              onChange={(e) => setGeologistNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Submit Verified Ground Truth & Trigger Automated Model Recalibration
          </button>
        </form>
      )}

      {/* Historical Calibration Log Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Historical Field Audits & Calibration Log:
        </h4>

        <div className="space-y-2.5">
          {feedbackList.map((rec, idx) => (
            <div key={`${rec.id || 'clf'}-${idx}`} className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <strong className="text-slate-100 text-sm">{rec.locationName}</strong>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      rec.actualEventOccurred
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    Actual Landslide: {rec.actualEventOccurred ? 'YES' : 'NO (FALSE ALARM)'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {rec.verifiedAt}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>
                  <span className="text-slate-400">Predicted Risk:</span>{' '}
                  <strong className="text-cyan-300">{rec.predictedRiskScore}% ({rec.predictedLevel})</strong> | Debris:{' '}
                  <strong>{rec.observedDebrisVolume}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Verified By:</span>{' '}
                  <span className="text-indigo-300 font-semibold">{rec.verifiedBy} ({rec.officerRole})</span>
                </div>
              </div>

              <p className="text-slate-300 text-[11px] italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                &ldquo;{rec.geotechnicalValidationNotes}&rdquo;
              </p>

              <div className="flex justify-between items-center text-[11px] text-emerald-400 font-mono">
                <span>➔ Status: {rec.status}</span>
                <span>Feedback Weight: {rec.recalibrationFeedbackWeight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
