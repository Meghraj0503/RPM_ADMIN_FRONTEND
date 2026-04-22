import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createQuestionnaire, getQuestionnaireDetail, updateQuestionnaire } from '../api/admin';
import { MdAddCircleOutline, MdDelete, MdContentCopy, MdArrowBack } from 'react-icons/md';

export default function QuestionnaireBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(isEditing);

  // Step 1 State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('One-Time');
  const [category, setCategory] = useState('General');

  // Step 2 State
  const [questions, setQuestions] = useState([
    { question_text: '', question_type: 'Short Answer', options_json: [] }
  ]);

  useEffect(() => {
    if (isEditing) {
      getQuestionnaireDetail(id)
        .then(res => {
          setTitle(res.data.title || '');
          setType(res.data.type || 'One-Time');
          setCategory(res.data.category || 'General');
          if (res.data.questions && res.data.questions.length > 0) {
            setQuestions(res.data.questions);
          }
          setStep(2); // Jump straight to builder if editing
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load questionnaire');
          navigate('/questionnaires');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate, isEditing]);

  const handleNext = () => {
    if (!title.trim() || !category.trim()) {
      alert('Please fill out Title and Category');
      return;
    }
    setStep(2);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question_text: '', question_type: 'Multiple Choice', options_json: ['Option 1'] }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    
    // Auto-setup options if switching to a choiced type
    if (field === 'question_type' && ['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(value)) {
      if (!updated[index].options_json || updated[index].options_json.length === 0) {
        updated[index].options_json = ['Option 1'];
      }
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options_json[oIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options_json.push(`Option ${updated[qIndex].options_json.length + 1}`);
    setQuestions(updated);
  };

  const handleDeleteOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options_json.splice(oIndex, 1);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleDuplicateQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index + 1, 0, JSON.parse(JSON.stringify(questions[index])));
    setQuestions(updated);
  };

  const handleSave = async () => {
    const invalid = questions.some(q => !q.question_text.trim());
    if (invalid) {
      alert('Missing question text for one or more questions.');
      return;
    }

    const payload = { title, type, category, questions };
    try {
      if (isEditing) {
        await updateQuestionnaire(id, payload);
        alert('Questionnaire updated successfully');
      } else {
        await createQuestionnaire(payload);
        alert('Questionnaire created successfully');
      }
      navigate('/questionnaires');
    } catch (e) {
      console.error(e);
      alert('Failed to save questionnaire');
    }
  };

  if (loading) return <div className="full-center" style={{ minHeight: 400 }}><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
        <MdArrowBack size={24} style={{ cursor: 'pointer', marginRight: 16 }} onClick={() => navigate('/questionnaires')} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {step === 1 ? 'Create new questionnaire' : title || 'Questionnaire Builder'}
        </h1>
      </div>

      {step === 1 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', textAlign: 'center' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4B5563', marginBottom: 8 }}>Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Enter title"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none' }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4B5563', marginBottom: 8 }}>Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none' }}
                >
                  <option value="One-Time">One time questionnaire</option>
                  <option value="Recurring">Recurring questionnaire</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4B5563', marginBottom: 8 }}>Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E7EB', outline: 'none' }}
                >
                  <option value="General">General</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Movement">Movement</option>
                  <option value="Heart Health">Heart Health</option>
                  <option value="Mental Health">Mental Health</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleNext} 
                style={{ background: '#00eebe', border: 'none', padding: '12px 40px', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ position: 'relative' }}>
          
          <div style={{ position: 'absolute', right: -60, top: 0, display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', padding: 12, borderRadius: 30, boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
             <MdAddCircleOutline size={24} style={{ color: '#00eebe', cursor: 'pointer' }} title="Add Question" onClick={handleAddQuestion} />
             {/* Stub icons for Google form layout match */}
             <div style={{ width: 24, height: 2, background: '#E5E7EB', margin: '4px 0' }} />
             <MdAddCircleOutline size={24} style={{ color: '#D1D5DB', cursor: 'not-allowed' }} title="Import" />
          </div>

          <div style={{ paddingBottom: 100 }}>
            {questions.map((q, qIndex) => (
              <div key={qIndex} style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: 20, borderLeft: '6px solid #00eebe' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <input 
                    type="text" 
                    placeholder="Untitled Question" 
                    value={q.question_text} 
                    onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    style={{ flex: 1, padding: '16px', fontSize: 16, fontWeight: 500, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', outline: 'none' }}
                  />
                </div>

                {/* Toolbar matching Google forms mock */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#ECFDF5', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
                  <span style={{ fontWeight: 'bold', fontFamily: 'serif', cursor: 'pointer' }}>B</span>
                  <span style={{ fontStyle: 'italic', fontFamily: 'serif', cursor: 'pointer' }}>I</span>
                  <span style={{ textDecoration: 'underline', fontFamily: 'serif', cursor: 'pointer' }}>U</span>
                  <span style={{ textDecoration: 'line-through', cursor: 'pointer' }}>T</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                  
                  <div style={{ flex: 1 }} />
                  <select 
                    value={q.question_type} 
                    onChange={e => handleQuestionChange(qIndex, 'question_type', e.target.value)}
                    style={{ width: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', outline: 'none', fontSize: 13, background: '#fff' }}
                  >
                    <option value="Short Answer">Short Answer</option>
                    <option value="Paragraph">Paragraph</option>
                    <option value="Multiple Choice">Multiple Choice</option>
                    <option value="Checkboxes">Checkboxes</option>
                    <option value="Dropdown">Dropdown</option>
                    <option value="Rating">Rating Scale (1-10)</option>
                  </select>
                </div>

                {/* Render Option Builder for Option-based types */}
                {['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(q.question_type) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginLeft: 16, background: '#ECFDF5', padding: 16, borderRadius: 8 }}>
                    {q.options_json.map((opt, oIndex) => (
                      <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 16, height: 16, borderRadius: q.question_type === 'Multiple Choice' ? '50%' : 4, border: '2px solid #9CA3AF' }} />
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          style={{ flex: 1, padding: '8px 4px', border: 'none', borderBottom: '1px solid #D1D5DB', outline: 'none', fontSize: 14, background: 'transparent' }}
                        />
                        {q.options_json.length > 1 && (
                          <MdDelete size={18} style={{ color: '#9CA3AF', cursor: 'pointer' }} onClick={() => handleDeleteOption(qIndex, oIndex)} />
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: q.question_type === 'Multiple Choice' ? '50%' : 4, border: '2px dashed #9CA3AF' }} />
                      <span style={{ fontSize: 14, color: '#0F766E', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleAddOption(qIndex)}>
                        Add option or <span style={{ textDecoration: 'underline' }}>Other</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Render Text Builder for Short Answer / Paragraph */}
                {['Short Answer', 'Paragraph'].includes(q.question_type) && (
                   <div style={{ marginLeft: 16, padding: '8px 0', borderBottom: '1px dotted #D1D5DB', width: '60%', color: '#9CA3AF', fontSize: 14 }}>
                     {q.question_type} text
                   </div>
                )}

                {/* Render Rating Scale Builder */}
                {q.question_type === 'Rating' && (
                  <div style={{ marginLeft: 16, display: 'flex', gap: 8, alignItems: 'center', color: '#9CA3AF', fontSize: 14 }}>
                    Scale: 1 to 10
                  </div>
                )}

                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 24, paddingTop: 16, borderTop: '1px solid #F3F4F6', color: '#6B7280' }}>
                   <MdContentCopy size={20} style={{ cursor: 'pointer' }} title="Duplicate" onClick={() => handleDuplicateQuestion(qIndex)} />
                   {questions.length > 1 && <MdDelete size={20} style={{ cursor: 'pointer' }} title="Delete" onClick={() => handleDeleteQuestion(qIndex)} />}
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button 
                onClick={handleSave} 
                style={{ background: '#00eebe', border: 'none', padding: '12px 60px', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 238, 190, 0.3)' }}
              >
                {isEditing ? 'Save Changes' : 'Create Questionnaire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
