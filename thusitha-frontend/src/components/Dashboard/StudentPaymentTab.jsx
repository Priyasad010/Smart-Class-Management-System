import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { request } from '../../services/api';
import { CreditCard, Upload, Calendar, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';

const StudentPaymentTab = ({ enrolledCourses = [] }) => {
  const [formData, setFormData] = useState({
    course_id: '',
    for_month: '',
    amount_paid: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'slip'
  const [slipFile, setSlipFile] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Mock Card Modal states
  const [showMockCardModal, setShowMockCardModal] = useState(false);
  const [mockPaymentUrl, setMockPaymentUrl] = useState('');
  const [mockCardDetails, setMockCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [mockProcessing, setMockProcessing] = useState(false);

  // 1. Fetch Payment History
  const fetchPaymentHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await request('/payments/my-payments');
      setPaymentHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 2. Handle Stripe / Mock Redirect Check
  useEffect(() => {
    const checkStripeConfirmation = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const sessionId = params.get('session_id');
      const courseId = params.get('course_id');
      const forMonth = params.get('for_month');
      const amount = params.get('amount');

      if (paymentStatus === 'success' && sessionId) {
        setSubmitting(true);
        setFeedback({ type: 'info', message: 'ඔන්ලයින් ගෙවීම තහවුරු කරමින් පවතී. කරුණාකර රැඳී සිටින්න...' });
        try {
          const res = await fetch('http://localhost:5000/api/payments/student/confirm-stripe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              session_id: sessionId,
              course_id: courseId,
              for_month: forMonth,
              amount: amount
            })
          });
          const result = await res.json();
          if (res.ok) {
            setFeedback({ type: 'success', message: '💳 ඔන්ලයින් ගෙවීම සාර්ථකව සිදු කරන ලදී! පන්ති ගාස්තුව ගෙවා අවසන්.' });
          } else {
            setFeedback({ type: 'error', message: result.message || 'ගෙවීම තහවුරු කිරීම අසාර්ථකයි.' });
          }
        } catch (err) {
          console.error(err);
          setFeedback({ type: 'error', message: 'ජාල සන්නිවේදන දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න.' });
        } finally {
          setSubmitting(false);
          // Clean search parameters from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchPaymentHistory();
        }
      } else if (paymentStatus === 'cancel') {
        setFeedback({ type: 'error', message: '❌ ගෙවීම් සැසිය අවලංගු කරන ලදී.' });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkStripeConfirmation();
    fetchPaymentHistory();
  }, []);

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    const selectedCourse = enrolledCourses.find(c => String(c.course_id) === String(selectedCourseId));
    
    setFormData({
      ...formData,
      course_id: selectedCourseId,
      amount_paid: selectedCourse ? (selectedCourse.monthly_fee || selectedCourse.fee || '') : ''
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSlipFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.for_month || !formData.amount_paid) {
      setFeedback({ type: 'error', message: 'කරුණාකර සියලුම ක්ෂේත්‍ර පුරවන්න.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    if (paymentMethod === 'card') {
      // Stripe checkout flow
      try {
        const response = await request('/payments/student/stripe-checkout', {
          body: {
            course_id: formData.course_id,
            for_month: formData.for_month,
            amount_paid: formData.amount_paid
          }
        });
        
        if (response && response.url) {
          if (response.isMock) {
            setMockPaymentUrl(response.url);
            setShowMockCardModal(true);
            setSubmitting(false);
          } else {
            setFeedback({ type: 'info', message: 'ගෙවීම් ද්වාරය වෙත යොමු කරමින් පවතී...' });
            window.location.href = response.url;
          }
        } else {
          setFeedback({ type: 'error', message: 'ගෙවීම් සැසියක් ආරම්භ කිරීමට නොහැකි විය.' });
          setSubmitting(false);
        }
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', message: err.message || 'ගෙවීම් ද්වාරයට සම්බන්ධ වීමේ දෝෂයකි.' });
        setSubmitting(false);
      }
    } else {
      // Bank Slip Upload Flow (Multipart Request)
      if (!slipFile) {
        setFeedback({ type: 'error', message: 'කරුණාකර බැංකු රිසිට්පත (Slip) තෝරන්න.' });
        setSubmitting(false);
        return;
      }

      const bodyData = new FormData();
      bodyData.append('slip', slipFile);
      bodyData.append('course_id', formData.course_id);
      bodyData.append('for_month', formData.for_month);
      bodyData.append('amount_paid', formData.amount_paid);

      try {
        const res = await fetch('http://localhost:5000/api/payments/student/upload-slip', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: bodyData
        });
        
        const result = await res.json();
        
        if (res.ok) {
          setFeedback({ type: 'success', message: '🧾 බැංකු රිසිට්පත සාර්ථකව උඩුගත කරන ලදී. පද්ධති සත්‍යාපනය සඳහා රැඳී සිටින්න.' });
          setFormData({ course_id: '', for_month: '', amount_paid: '' });
          setSlipFile(null);
          fetchPaymentHistory();
        } else {
          setFeedback({ type: 'error', message: result.message || 'රිසිට්පත උඩුගත කිරීම අසාර්ථකයි.' });
        }
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', message: 'ජාල සන්නිවේදන දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න.' });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleMockPaymentSubmit = (e) => {
    e.preventDefault();
    if (!mockCardDetails.number || !mockCardDetails.expiry || !mockCardDetails.cvc) {
      alert('කරුණාකර සියලුම කාඩ්පත් විස්තර ඇතුළත් කරන්න.');
      return;
    }
    setMockProcessing(true);
    setTimeout(() => {
      setMockProcessing(false);
      setShowMockCardModal(false);
      window.location.href = mockPaymentUrl;
    }, 1500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return (
          <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> සාර්ථකයි (Paid)
          </span>
        );
      case 'Pending Verification':
        return (
          <span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 w-fit">
            <Clock size={12} /> සත්‍යාපනය වෙමින් (Pending)
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 text-xs font-bold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> ප්‍රතික්ෂේපිතයි (Rejected)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* feedback message banner */}
      {feedback.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all duration-300 ${
          feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          feedback.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          feedback.type === 'info' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
          'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="shrink-0 text-green-600" /> : <AlertCircle className="shrink-0 text-rose-600" />}
          <span className="font-semibold text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Make a Payment Form Section */}
        <div className="lg:col-span-1.2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-100/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                <CreditCard size={22} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">💳 පන්ති ගාස්තු ගෙවීම (Make Payment)</h3>
                <p className="text-xs text-slate-400 mt-0.5">පන්තිය සඳහා මාසික ගාස්තු ඔන්ලයින් ගෙවන්න</p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">පන්තිය තෝරන්න (Select Class)</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium transition-all"
                  value={formData.course_id}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">-- පන්තිය තෝරන්න --</option>
                  {enrolledCourses.map(c => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name} ({c.teacher_name}) - Rs.{c.monthly_fee || c.fee}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">අදාළ මාසය (Month)</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium transition-all"
                    value={formData.for_month}
                    onChange={(e) => setFormData({...formData, for_month: e.target.value})}
                    required
                  >
                    <option value="">-- මාසය --</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">මුදල (Rs.)</label>
                  <input 
                    type="number"
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold focus:outline-none"
                    value={formData.amount_paid}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ගෙවීම් ක්‍රමය (Method)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 font-semibold transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="text-xs">Card Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('slip')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 font-semibold transition-all ${
                      paymentMethod === 'slip' 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Upload size={20} />
                    <span className="text-xs">Bank Slip Upload</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'slip' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center transition-all">
                  <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-600 mb-2">ඔබගේ රිසිට්පත (Image/PDF) තෝරන්න</span>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white file:cursor-pointer cursor-pointer"
                    onChange={handleFileChange}
                    required={paymentMethod === 'slip'}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    සකසමින් පවතී...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'card' ? <CreditCard size={18} /> : <Upload size={18} />}
                    {paymentMethod === 'card' ? '💳 ඔන්ලයින් ගෙවන්න' : '📤 රිසිට්පත සුරකින්න'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="lg:col-span-1.8 bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-100/40">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
              <Calendar size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">🕒 මගේ ගෙවීම් ඉතිහාසය (Payment History)</h3>
              <p className="text-xs text-slate-400 mt-0.5">පෙර කරන ලද සියලුම ගෙවීම් විස්තර</p>
            </div>
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600"></div>
              <span className="text-sm font-medium">දත්ත පූරණය වෙමින්...</span>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-xl">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">පෙර කරන ලද කිසිදු ගෙවීමක් හමු නොවීය.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
                  <tr>
                    <th className="px-4 py-3">පන්තිය (Class)</th>
                    <th className="px-4 py-3">මාසය (Month)</th>
                    <th className="px-4 py-3">මුදල (Amount)</th>
                    <th className="px-4 py-3">ක්‍රමය (Method)</th>
                    <th className="px-4 py-3">තත්ත්වය (Status)</th>
                    <th className="px-4 py-3 text-right">දිනය (Date)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {paymentHistory.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.course_name}</td>
                      <td className="px-4 py-3 font-medium">{p.for_month}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600">Rs. {parseFloat(p.amount_paid).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(p.payment_status)}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">
                        {new Date(p.payment_date).toLocaleDateString('si-LK', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Mock Card Payment Modal */}
      {showMockCardModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                <CreditCard size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">💳 කාඩ්පත් ගෙවීම (Mock Sandbox)</h3>
                <p className="text-xs text-slate-400">අත්හදා බැලීම සඳහා ඩමි කාඩ්පත් විස්තර ඇතුළත් කරන්න</p>
              </div>
            </div>

            <form onSubmit={handleMockPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">කාඩ්පත් අංකය (Card Number)</label>
                <input 
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition-all"
                  value={mockCardDetails.number}
                  onChange={(e) => setMockCardDetails({...mockCardDetails, number: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">කල් ඉකුත්වීමේ දිනය (Expiry)</label>
                  <input 
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition-all"
                    value={mockCardDetails.expiry}
                    onChange={(e) => setMockCardDetails({...mockCardDetails, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                  <input 
                    type="password"
                    required
                    placeholder="123"
                    maxLength="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition-all"
                    value={mockCardDetails.cvc}
                    onChange={(e) => setMockCardDetails({...mockCardDetails, cvc: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">කාඩ්පතේ නම (Name on Card)</label>
                <input 
                  type="text"
                  required
                  placeholder="Ishadhi Upeksha"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium transition-all"
                  value={mockCardDetails.name}
                  onChange={(e) => setMockCardDetails({...mockCardDetails, name: e.target.value})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMockCardModal(false)}
                  disabled={mockProcessing}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  disabled={mockProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-80"
                >
                  {mockProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      සැකසෙමින්...
                    </>
                  ) : (
                    'ගෙවීම සිදුකරන්න'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

StudentPaymentTab.propTypes = {
  enrolledCourses: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default StudentPaymentTab;
