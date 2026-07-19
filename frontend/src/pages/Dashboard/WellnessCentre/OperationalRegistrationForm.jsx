import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { CheckCircle, Clock, AlertCircle, FileText, Upload, HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';

export default function OperationalRegistrationForm({ isOpen, onClose, onSuccess, user }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Track upload progress per field: { [fieldName]: percent | 'done' | 'error' }
  const [uploadProgress, setUploadProgress] = useState({});

  // Form Data State
  const [formData, setFormData] = useState({
    already_on_portal: false,
    portal_reg_reason: '',
    previous_reg_number: '',
    previous_reg_certificate: '', // path string

    centre_name: '',
    district: '',
    address: '',
    gps_lat: '',
    gps_lng: '',
    google_map_link: '',
    owner_name: '',
    mobile: '',
    is_residential: false,
    offers_clinical: false,
    category: 'AYUSH Wellness Therapy Centre',
    services_offered: [], // array of strings
    
    // Section 2: Clinical
    doctor_appointed: false,
    doctor_name: '',
    doctor_qualification: '',
    doctor_qual_doc: '', // path string
    bcp_reg_number: '',
    bcp_reg_doc: '', // path string
    cea_reg_number: '',
    cea_valid_till: '',
    cea_reg_certificate: '', // path string
    cea_registered: false,
    declaration_board: false,
    declaration_signboard: false,
    clinical_affidavit: '', // path string

    // Section 3: Infra
    reception_area_sqft: '',
    waiting_capacity: '',
    consultation_rooms: '',
    incharge_name: '',
    incharge_mobile: '',
    emergency_centre_name: '',
    emergency_distance_m: '',
    offers_prakruti: false,
    website: '',
    service_charges_doc: '', // path string
    brochure_doc: '', // path string
    num_beds: '',
    kitchen_available: false,
    dosha_dietetics: false,
    parking_cars: '',
    cctv_supervised: false,
    
    // Service rooms
    abhyanga_rooms: '',
    vasti_rooms: '',
    post_therapy_waiting_rooms: '',
    medicine_dispensing_rooms: '',
    marma_rooms: '',
    para_surgical_rooms: '',
    kshar_sutra_ot: '',
    yoga_halls: '',
    meditation_halls: '',
    shatkarma_rooms: '',
    massage_rooms: '',
    enema_rooms: '',
    hydrotherapy_rooms: '',

    // Section 4: Staff
    receptionist_count: '',
    sanitation_worker_count: '',
    mpw_count: '',
    cook_count: '',
    watchman_count: '',
    pharmacist_name: '',
    pharmacist_reg_number: '',
    pharmacist_bcp_doc: '', // path string
    wc_attendant_count: '',
    ayurveda_nurse_count: '',
    male_panchakarma_therapist: '',
    female_panchakarma_therapist: '',
    panchakarma_staff_bcp_doc: '', // path string
    yoga_instructor_count: '',
    yoga_instructor_qual_doc: '', // path string
    bnys_doctor_name: '',
    bnys_reg_certificate: '', // path string
    male_naturopathy_attendant: '',
    female_naturopathy_attendant: '',
    naturopathy_staff_bcp_doc: '', // path string

    // Section 5: Declarations
    fee_deposited: false,
    fee_receipt_doc: '', // path string
    all_declarations_accepted: false,
    declaration_affidavit: '', // path string
    dec_1: false, dec_2: false, dec_3: false, dec_4: false, dec_5: false,
    dec_6: false, dec_7: false, dec_8: false, dec_9: false, dec_10: false,
    dec_11: false, dec_12: false, dec_13: false, dec_14: false, dec_15: false,
    dec_16: false, dec_17: false, dec_18: false, dec_final: false
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        owner_name: prev.owner_name || user.full_name || '',
        mobile: prev.mobile || user.phone || '',
        district: prev.district || user.district || ''
      }));
    }
  }, [user]);

  // Category Auto Selection
  useEffect(() => {
    let newCat = 'AYUSH Wellness Therapy Centre';
    if (!formData.is_residential && !formData.offers_clinical) {
      newCat = 'AYUSH Wellness Therapy Centre';
    } else if (formData.is_residential && !formData.offers_clinical) {
      newCat = 'AYUSH Gram or AYUSH Resort';
    } else if (formData.offers_clinical) {
      newCat = 'AYUSH Wellness Centre & Hospital';
    }
    
    setFormData(prev => {
      let currentServices = [...prev.services_offered];
      if (newCat !== 'AYUSH Wellness Centre & Hospital') {
        const hospitalOnly = ['Ayurveda', 'Kshar Sutra', 'Kshar Karma', 'Siravedha & Leech Therapy', 'Agni Karma', 'Marma Chikitsa'];
        currentServices = currentServices.filter(s => !hospitalOnly.includes(s));
      }
      return { ...prev, category: newCat, services_offered: currentServices };
    });
  }, [formData.is_residential, formData.offers_clinical]);

  // Auto-calculate minimum staff counts based on no of beds filled in section 3
  useEffect(() => {
    const beds = parseInt(formData.num_beds) || 0;
    const isAyurveda = formData.services_offered.includes('Ayurveda');
    const isPanchakarma = formData.services_offered.includes('Panchakarma');
    const isNaturopathy = formData.services_offered.includes('Naturopathy');
    const isTherapyOrGram = formData.category === 'AYUSH Wellness Therapy Centre' || formData.category === 'AYUSH Gram or AYUSH Resort';
    const isHospitalOrGram = formData.category === 'AYUSH Wellness Centre & Hospital' || formData.category === 'AYUSH Gram or AYUSH Resort';

    setFormData(prev => {
      const updates = {};
      
      if (isHospitalOrGram) {
        const minMpw = beds > 0 ? Math.max(1, Math.ceil(beds / 10)) : 1;
        if (!prev.mpw_count || parseInt(prev.mpw_count) < minMpw) {
          updates.mpw_count = minMpw.toString();
        }
        if (!prev.cook_count || parseInt(prev.cook_count) < 1) {
          updates.cook_count = '1';
        }
        if (!prev.watchman_count || parseInt(prev.watchman_count) < 1) {
          updates.watchman_count = '1';
        }
      } else {
        updates.mpw_count = '';
        updates.cook_count = '';
        updates.watchman_count = '';
      }

      if (isTherapyOrGram && isAyurveda) {
        if (prev.is_residential) {
          // Wellness Centre Attendant & Ayurveda Nurse: minimum 02 for every 10 Bed
          const minAtt = beds > 0 ? Math.max(2, Math.ceil(beds / 10) * 2) : 2;
          if (!prev.wc_attendant_count || parseInt(prev.wc_attendant_count) < minAtt) {
            updates.wc_attendant_count = minAtt.toString();
          }
          const minNurse = beds > 0 ? Math.max(2, Math.ceil(beds / 10) * 2) : 2;
          if (!prev.ayurveda_nurse_count || parseInt(prev.ayurveda_nurse_count) < minNurse) {
            updates.ayurveda_nurse_count = minNurse.toString();
          }
        } else {
          // Reset or do not enforce if not residential
          updates.wc_attendant_count = '';
          updates.ayurveda_nurse_count = '';
        }
      }

      if (isPanchakarma) {
        // Male & Female Panchakarma Therapist: minimum 1 for every 10 Bed
        const minPanch = beds > 0 ? Math.max(1, Math.ceil(beds / 10)) : 1;
        if (!prev.male_panchakarma_therapist || parseInt(prev.male_panchakarma_therapist) < minPanch) {
          updates.male_panchakarma_therapist = minPanch.toString();
        }
        if (!prev.female_panchakarma_therapist || parseInt(prev.female_panchakarma_therapist) < minPanch) {
          updates.female_panchakarma_therapist = minPanch.toString();
        }
      }

      if (isNaturopathy) {
        // Male & Female Yog & Naturopathy Attendant: minimum 1 for every 10 Bed
        const minNat = beds > 0 ? Math.max(1, Math.ceil(beds / 10)) : 1;
        if (!prev.male_naturopathy_attendant || parseInt(prev.male_naturopathy_attendant) < minNat) {
          updates.male_naturopathy_attendant = minNat.toString();
        }
        if (!prev.female_naturopathy_attendant || parseInt(prev.female_naturopathy_attendant) < minNat) {
          updates.female_naturopathy_attendant = minNat.toString();
        }
      }

      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [formData.num_beds, formData.services_offered, formData.category]);

  const validateSection = (currentStep) => {
    setError(null);
    const beds = parseInt(formData.num_beds) || 0;

    if (currentStep === 1) {
      if (!formData.centre_name.trim()) return 'Centre Name is required.';
      if (!formData.district) return 'District is required.';
      if (!formData.address.trim()) return 'Address is required.';
      if (formData.already_on_portal) {
        if (!formData.portal_reg_reason) return 'Reason for previous registration is required.';
        if (!formData.previous_reg_number.trim()) return 'Previous registration number is required.';
        if (!formData.previous_reg_certificate) return 'Please upload previous registration certificate.';
      }
      if (formData.services_offered.length === 0) return 'Please select at least one service offered.';
    }

    if (currentStep === 2) {
      if (formData.category === 'AYUSH Wellness Therapy Centre') {
        if (formData.doctor_appointed) {
          if (!formData.doctor_name.trim()) return 'Doctor Name is required.';
          if (!formData.doctor_qualification) return 'Doctor Qualification is required.';
          if (!formData.doctor_qual_doc) return 'Please upload Doctor Qualification Document.';
          if (!formData.bcp_reg_number.trim()) return 'BCP Registration Number is required.';
          if (!formData.bcp_reg_doc) return 'Please upload BCP Registration Document.';
        }
        if (!formData.declaration_board || !formData.declaration_signboard) {
          return 'Please accept the mandatory declarations for Therapy Centres.';
        }
        if (!formData.clinical_affidavit) return 'Please upload Affidavit regarding clinical declaration.';
      }
      if (formData.category === 'AYUSH Wellness Centre & Hospital') {
        if (!formData.doctor_name.trim()) return 'Doctor Name is required.';
        if (!formData.doctor_qualification) return 'Doctor Qualification is required.';
        if (!formData.doctor_qual_doc) return 'Please upload Doctor Qualification Document.';
        if (!formData.bcp_reg_number.trim()) return 'BCP Registration Number is required.';
        if (!formData.bcp_reg_doc) return 'Please upload BCP Registration Document.';
        if (!formData.cea_reg_number.trim()) return 'CEA Registration Number is required.';
        if (!formData.cea_valid_till) return 'CEA Validity Date is required.';
        if (!formData.cea_reg_certificate) return 'Please upload CEA Registration Certificate.';
      }
      if (formData.category === 'AYUSH Gram or AYUSH Resort') {
        if (formData.doctor_name.trim()) {
          if (!formData.doctor_qualification) return 'Doctor Qualification is required.';
          if (!formData.doctor_qual_doc) return 'Please upload Doctor Qualification Document.';
          if (!formData.bcp_reg_number.trim()) return 'BCP Registration Number is required.';
          if (!formData.bcp_reg_doc) return 'Please upload BCP Registration Document.';
        }
        if (formData.cea_registered) {
          if (!formData.cea_reg_number.trim()) return 'CEA Registration Number is required.';
          if (!formData.cea_valid_till) return 'CEA Validity Date is required.';
          if (!formData.cea_reg_certificate) return 'Please upload CEA Registration Certificate.';
        } else {
          if (!formData.declaration_board || !formData.declaration_signboard) {
            return 'Please accept the mandatory declarations.';
          }
          if (!formData.clinical_affidavit) return 'Please upload Affidavit regarding declaration.';
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.reception_area_sqft) return 'Reception Area size is required.';
      if (!formData.waiting_capacity) return 'Waiting Capacity is required.';
      if (!formData.consultation_rooms) return 'Consultation Rooms count is required.';
      if (!formData.incharge_name.trim()) return 'Incharge Name is required.';
      if (!formData.incharge_mobile.trim()) return 'Incharge Mobile is required.';
      if (!formData.emergency_centre_name.trim()) return 'Emergency Referral Centre Name is required.';
      if (!formData.emergency_distance_m) return 'Emergency Referral Centre Distance is required.';
      if (!formData.service_charges_doc) return 'Please upload the Service Charges List Document.';

      // Service-specific room checks
      if (formData.services_offered.includes('Panchakarma')) {
        if (parseInt(formData.abhyanga_rooms) < 2) return 'At least 2 Abhyanga Rooms are required for Panchakarma.';
        if (parseInt(formData.vasti_rooms) < 1) return 'At least 1 Vasti Room is required for Panchakarma.';
        if (parseInt(formData.post_therapy_waiting_rooms) < 1) return 'At least 1 Post Therapy Waiting Room is required for Panchakarma.';
      }
      if (formData.services_offered.includes('Ayurveda')) {
        if (parseInt(formData.medicine_dispensing_rooms) < 1) return 'At least 1 Medicine Dispensing Room is required for Ayurveda.';
      }
      if (formData.services_offered.includes('Marma Chikitsa')) {
        if (parseInt(formData.marma_rooms) < 1) return 'At least 1 Marma Chikitsa Room is required.';
      }
      if (formData.services_offered.includes('Siravedha & Leech Therapy') || formData.services_offered.includes('Agni Karma') || formData.services_offered.includes('Kshar Karma')) {
        if (parseInt(formData.para_surgical_rooms) < 1) return 'At least 1 Para Surgical Therapy Room is required.';
      }
      if (formData.services_offered.includes('Kshar Sutra')) {
        if (parseInt(formData.kshar_sutra_ot) < 1) return 'At least 1 Kshar Sutra OT is required.';
      }
      if (formData.services_offered.includes('Yoga')) {
        if (parseInt(formData.yoga_halls) < 1) return 'At least 1 Yoga Hall (Min 350 sqft) is required.';
        if (parseInt(formData.meditation_halls) < 1) return 'At least 1 Meditation Hall is required.';
        if (parseInt(formData.shatkarma_rooms) < 1) return 'At least 1 Shatkarma Room is required.';
      }
      if (formData.services_offered.includes('Naturopathy')) {
        if (parseInt(formData.massage_rooms) < 2) return 'At least 2 Naturopathy Massage Rooms are required.';
        if (parseInt(formData.enema_rooms) < 1) return 'At least 1 Enema Room is required.';
        if (parseInt(formData.hydrotherapy_rooms) < 1) return 'At least 1 Hydrotherapy Room is required.';
      }

      if (formData.offers_clinical && formData.category !== 'AYUSH Wellness Therapy Centre') {
        if (!formData.num_beds || parseInt(formData.num_beds) <= 0) {
          return 'Number of Beds must be greater than 0 since clinical services are offered.';
        }
      }
    }

    if (currentStep === 4) {
      if (parseInt(formData.receptionist_count || 0) < 1) return 'At least 1 Receptionist is required.';
      if (parseInt(formData.sanitation_worker_count || 0) < 1) return 'At least 1 Sanitation Worker is required.';

      const isAyurveda = formData.services_offered.includes('Ayurveda');
      const isPanchakarma = formData.services_offered.includes('Panchakarma');
      const isNaturopathy = formData.services_offered.includes('Naturopathy');
      const isTherapyOrGram = formData.category === 'AYUSH Wellness Therapy Centre' || formData.category === 'AYUSH Gram or AYUSH Resort';
      const isHospitalOrGram = formData.category === 'AYUSH Wellness Centre & Hospital' || formData.category === 'AYUSH Gram or AYUSH Resort';

      if (isHospitalOrGram) {
        const minMpw = beds > 0 ? Math.max(1, Math.ceil(beds / 10)) : 1;
        if (parseInt(formData.mpw_count || 0) < minMpw) return `At least ${minMpw} MPW worker(s) are required (min 1 per 10 beds).`;
        if (parseInt(formData.cook_count || 0) < 1) return 'At least 1 Cook is required.';
        if (parseInt(formData.watchman_count || 0) < 1) return 'At least 1 Watchman is required.';
      }

      if (isTherapyOrGram && isAyurveda) {
        if (!formData.pharmacist_name.trim()) return 'Pharmacist Name is required.';
        if (!formData.pharmacist_reg_number.trim()) return 'Pharmacist BCP Registration Number is required.';
        if (!formData.pharmacist_bcp_doc) return 'Please upload Pharmacist BCP License Doc.';

        if (formData.is_residential) {
          const minAtt = beds > 0 ? Math.max(2, Math.ceil(beds / 10) * 2) : 2;
          if (parseInt(formData.wc_attendant_count || 0) < minAtt) return `At least ${minAtt} Wellness Centre Attendants are required (min 2 per 10 beds).`;
          
          const minNurse = beds > 0 ? Math.max(2, Math.ceil(beds / 10) * 2) : 2;
          if (parseInt(formData.ayurveda_nurse_count || 0) < minNurse) return `At least ${minNurse} Ayurveda Nurses are required (min 2 per 10 beds).`;
        }
      }

      if (isPanchakarma) {
        const minPanch = beds > 0 ? Math.max(1, Math.ceil(beds / 10)) : 1;
        if (parseInt(formData.male_panchakarma_therapist || 0) < minPanch) return `At least ${minPanch} Male Panchakarma Therapist is required (min 1 per 10 beds).`;
        if (parseInt(formData.female_panchakarma_therapist || 0) < minPanch) return `At least ${minPanch} Female Panchakarma Therapist is required (min 1 per 10 beds).`;
        if (!formData.panchakarma_staff_bcp_doc) return 'Please upload Panchakarma Staff BCP Registrations.';
      }

      if (formData.services_offered.includes('Yoga')) {
        if (parseInt(formData.yoga_instructor_count || 0) < 1) return 'At least 1 Yoga Instructor is required.';
        if (!formData.yoga_instructor_qual_doc) return 'Please upload Yoga Instructor Qualification Doc.';
      }

      if (isNaturopathy) {
        const minNat = beds > 0 ? Math.max(1, Math.ceil(beds / 10)) : 1;
        if (!formData.bnys_doctor_name.trim()) return 'Naturopathy BNYS Doctor Name is required.';
        if (!formData.bnys_reg_certificate) return 'Please upload BNYS Registration Certificate.';
        if (parseInt(formData.male_naturopathy_attendant || 0) < minNat) return `At least ${minNat} Male Yog & Naturopathy Attendants are required (min 1 per 10 beds).`;
        if (parseInt(formData.female_naturopathy_attendant || 0) < minNat) return `At least ${minNat} Female Yog & Naturopathy Attendants are required (min 1 per 10 beds).`;
        if (!formData.naturopathy_staff_bcp_doc) return 'Please upload Naturopathy Attendants BCP Registrations.';
      }
    }

    return null;
  };

  const handleNext = () => {
    const errorMsg = validateSection(step);
    if (errorMsg) {
      setError(errorMsg);
      const scrollArea = document.querySelector('.wcr-scroll-area');
      if (scrollArea) scrollArea.scrollTop = 0;
    } else {
      setError(null);
      setStep(step + 1);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInstantFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

    try {
      const res = await axiosInstance.post('/api/wellness/upload-single-file', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [fieldName]: percentCompleted }));
        }
      });

      if (res.data.success) {
        setFormData(prev => ({ ...prev, [fieldName]: res.data.filePath }));
        setUploadProgress(prev => ({ ...prev, [fieldName]: 'done' }));
      }
    } catch (err) {
      console.error(err);
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'error' }));
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const exists = prev.services_offered.includes(service);
      if (exists) {
        return { ...prev, services_offered: prev.services_offered.filter(s => s !== service) };
      } else {
        return { ...prev, services_offered: [...prev.services_offered, service] };
      }
    });
  };

  const districts = ['Dehradun', 'Haridwar', 'Tehri Garhwal', 'Pauri Garhwal', 'Chamoli', 'Rudraprayag', 'Uttarkashi', 'Pithoragarh', 'Bageshwar', 'Almora', 'Champawat', 'Nainital', 'Udham Singh Nagar'];
  
  const allServices = ['Yoga', 'Naturopathy', 'Panchakarma', 'Ayurveda', 'Kshar Sutra', 'Kshar Karma', 'Siravedha & Leech Therapy', 'Agni Karma', 'Marma Chikitsa'];
  const hospitalServices = ['Ayurveda', 'Kshar Sutra', 'Kshar Karma', 'Siravedha & Leech Therapy', 'Agni Karma', 'Marma Chikitsa'];

  const handleSubmit = async () => {
    setError(null);
    const errorMsg = validateSection(5);
    if (errorMsg) {
      setError(errorMsg);
      const scrollArea = document.querySelector('.wcr-scroll-area');
      if (scrollArea) scrollArea.scrollTop = 0;
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post('/api/wellness/operational-registration', formData);
      setIsSubmitting(false);
      onSuccess(res.data?.registration_number || 'REG-SUCCESS');
    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    }
  };

  if (!isOpen) return null;

  const allDeclarationsChecked = Array.from({ length: 18 }, (_, i) => formData[`dec_${i + 1}`]).every(val => val) && formData.dec_final;
  const canSubmit = formData.fee_deposited && allDeclarationsChecked && formData.fee_receipt_doc && formData.declaration_affidavit;

  const DocLink = ({ path }) => {
    if (!path) return null;
    return (
      <a href={path.startsWith('http') ? path : `${axiosInstance.defaults.baseURL || ''}${path}`} target="_blank" rel="noreferrer" className="wcr-doc-view-link">
        <FileText size={14} /> View Uploaded File
      </a>
    );
  };

  const renderUploadControl = (fieldName, label, hint) => {
    const progress = uploadProgress[fieldName];
    const path = formData[fieldName];

    return (
      <div className="wcr-field-group">
        <label className="wcr-label">
          {label}
          {hint && <span className="wcr-field-hint-tooltip" data-hint={hint}><HelpCircle size={14} /></span>}
        </label>
        <div className="wcr-file-upload-wrapper">
          <input
            type="file"
            onChange={(e) => handleInstantFileUpload(e, fieldName)}
            style={{ display: 'none' }}
            id={`file-input-${fieldName}`}
          />
          <label htmlFor={`file-input-${fieldName}`} className="wcr-file-upload-trigger">
            <Upload size={16} /> Choose File
          </label>
          <span className="wcr-filename-display">
            {path ? '✓ File uploaded successfully' : 'No file selected'}
          </span>
        </div>
        {progress !== undefined && progress !== 'done' && progress !== 'error' && (
          <div className="wcr-file-progress-container">
            <div className="wcr-file-progress-bar" style={{ width: `${progress}%` }}></div>
            <span className="wcr-file-progress-text">Uploading {progress}%</span>
          </div>
        )}
        {progress === 'done' && <div className="wcr-upload-status wcr-success"><CheckCircle size={14} /> Upload completed</div>}
        {progress === 'error' && <div className="wcr-upload-status wcr-danger"><AlertCircle size={14} /> Upload failed. Retry</div>}
        <DocLink path={path} />
      </div>
    );
  };

  return (
    <div className="wcr-modal-overlay">
      <style>{`
        .wcr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .wcr-modal-content {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 950px;
          max-height: 90vh;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(22, 101, 52, 0.15);
          animation: wcr-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes wcr-fade-in {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .wcr-modal-header {
          background: linear-gradient(135deg, #14532d, #166534);
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ffffff;
        }
        .wcr-modal-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .wcr-close-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #ffffff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wcr-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        .wcr-step-nav {
          display: flex;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 32px;
          gap: 12px;
          overflow-x: auto;
        }
        .wcr-step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }
        .wcr-step-item.active {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }
        .wcr-step-item.completed {
          background: #f0fdf4;
          color: #15803d;
          border-color: #bbf7d0;
        }
        .wcr-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }
        .wcr-section-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 12px;
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }
        .wcr-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px 28px;
        }
        .wcr-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .wcr-label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .wcr-field-hint {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
        .wcr-input, .wcr-select, .wcr-textarea {
          padding: 11px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
          background: #ffffff;
        }
        .wcr-input:focus, .wcr-select:focus, .wcr-textarea:focus {
          outline: none;
          border-color: #166534;
          box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.12);
        }
        .wcr-file-upload-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 8px 12px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
        }
        .wcr-file-upload-trigger {
          background: #166534;
          color: #ffffff;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .wcr-file-upload-trigger:hover {
          background: #15803d;
        }
        .wcr-filename-display {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
        .wcr-file-progress-container {
          background: #e2e8f0;
          height: 6px;
          border-radius: 3px;
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }
        .wcr-file-progress-bar {
          background: #10b981;
          height: 100%;
          transition: width 0.2s;
        }
        .wcr-file-progress-text {
          font-size: 10px;
          color: #64748b;
          position: absolute;
          right: 0;
          top: -14px;
        }
        .wcr-upload-status {
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .wcr-upload-status.wcr-success { color: #10b981; }
        .wcr-upload-status.wcr-danger { color: #ef4444; }
        .wcr-doc-view-link {
          font-size: 12px;
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .wcr-doc-view-link:hover {
          text-decoration: underline;
        }
        .wcr-toggle-group {
          display: flex;
          gap: 16px;
        }
        .wcr-toggle-card {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wcr-toggle-card.active {
          border-color: #166534;
          background: #f0fdf4;
        }
        .wcr-category-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-left: 4px solid #3b82f6;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .wcr-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .wcr-chip-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .wcr-chip-btn.active {
          background: #166534;
          color: #ffffff;
          border-color: #166534;
        }
        .wcr-footer {
          padding: 20px 32px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .wcr-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .wcr-btn-primary {
          background: #166534;
          color: #ffffff;
          border: none;
        }
        .wcr-btn-primary:hover {
          background: #15803d;
        }
        .wcr-btn-secondary {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .wcr-btn-secondary:hover {
          background: #f8fafc;
        }
        .wcr-field-hint-tooltip {
          position: relative;
          color: #94a3b8;
          cursor: pointer;
        }
        .wcr-field-hint-tooltip::after {
          content: attr(data-hint);
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          white-space: pre-wrap;
          width: 220px;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          font-weight: 500;
          line-height: 1.4;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .wcr-field-hint-tooltip:hover::after {
          opacity: 1;
          visibility: visible;
        }
      `}</style>

      <div className="wcr-modal-content">
        <div className="wcr-modal-header">
          <h2>Operational Registration Form</h2>
          <button className="wcr-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="wcr-step-nav">
          {['General Info', 'Clinical Info', 'Infrastructure', 'Additional Staff', 'Fee & Declarations'].map((label, idx) => {
            const currentStep = idx + 1;
            let statusClass = 'pending';
            if (step === currentStep) statusClass = 'active';
            else if (step > currentStep) statusClass = 'completed';

            return (
              <div key={label} className={`wcr-step-item ${statusClass}`}>
                <span className="wcr-step-number">{currentStep}</span>
                <span className="wcr-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="wcr-scroll-area">
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* STEP 1: General Info */}
          {step === 1 && (
            <div className="wcr-step-pane">
              <div className="wcr-section-title">Section 1: General Information</div>
              
              <div className="wcr-grid-2">
                <div className="wcr-field-group">
                  <label className="wcr-label">
                    Already Registered on Portal?
                    <span className="wcr-field-hint-tooltip" data-hint="Select Yes if your centre has been previously registered on Apuni Sarkar or AYUSH Setu."><HelpCircle size={14} /></span>
                  </label>
                  <select
                    name="already_on_portal"
                    className="wcr-select"
                    value={formData.already_on_portal}
                    onChange={(e) => setFormData(prev => ({ ...prev, already_on_portal: e.target.value === 'true' }))}
                  >
                    <option value="false">No, First Time Registration</option>
                    <option value="true">Yes, Already Registered</option>
                  </select>
                </div>

                {formData.already_on_portal && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Reason for Registration</label>
                      <select name="portal_reg_reason" className="wcr-select" value={formData.portal_reg_reason} onChange={handleChange}>
                        <option value="">Select Option</option>
                        <option value="Renewal">Renewal (Certificate Expired)</option>
                        <option value="Migration">Migration (Transfer from old portal)</option>
                      </select>
                    </div>

                    <div className="wcr-field-group">
                      <label className="wcr-label">Previous Registration Number</label>
                      <input
                        type="text"
                        name="previous_reg_number"
                        placeholder="e.g. UK-WC-2023-0182"
                        className="wcr-input"
                        value={formData.previous_reg_number}
                        onChange={handleChange}
                      />
                    </div>

                    {renderUploadControl('previous_reg_certificate', 'Previous Registration Certificate', 'Upload your older registration or migration certificate (PDF/JPEG)')}
                  </>
                )}
              </div>

              <div style={{ margin: '24px 0', borderTop: '1px solid #f1f5f9' }}></div>

              <div className="wcr-grid-2">
                <div className="wcr-field-group">
                  <label className="wcr-label">Centre Name</label>
                  <input
                    type="text"
                    name="centre_name"
                    placeholder="Enter the official name of the centre"
                    className="wcr-input"
                    value={formData.centre_name}
                    onChange={handleChange}
                  />
                  <span className="wcr-field-hint">This name will appear on the public registry certificate</span>
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">District</label>
                  <select name="district" className="wcr-select" value={formData.district} onChange={handleChange}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="wcr-field-group" style={{ gridColumn: 'span 2' }}>
                  <label className="wcr-label">Full Physical Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    placeholder="Complete address of the wellness centre..."
                    className="wcr-textarea"
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">GPS Latitude</label>
                  <input type="text" name="gps_lat" placeholder="e.g. 30.3165" className="wcr-input" value={formData.gps_lat} onChange={handleChange} />
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">GPS Longitude</label>
                  <input type="text" name="gps_lng" placeholder="e.g. 78.0322" className="wcr-input" value={formData.gps_lng} onChange={handleChange} />
                </div>

                <div className="wcr-field-group" style={{ gridColumn: 'span 2' }}>
                  <label className="wcr-label">Google Map URL (Optional)</label>
                  <input
                    type="text"
                    name="google_map_link"
                    placeholder="https://maps.google.com/..."
                    className="wcr-input"
                    value={formData.google_map_link}
                    onChange={handleChange}
                  />
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">Owner Name</label>
                  <input type="text" name="owner_name" className="wcr-input" value={formData.owner_name} onChange={handleChange} />
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">Mobile Number</label>
                  <input type="text" name="mobile" className="wcr-input" value={formData.mobile} onChange={handleChange} />
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">Residential Facility?</label>
                  <div className="wcr-toggle-group">
                    <div className={`wcr-toggle-card ${formData.is_residential ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, is_residential: true }))}>
                      <span style={{ fontWeight: 700 }}>Yes</span>
                    </div>
                    <div className={`wcr-toggle-card ${!formData.is_residential ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, is_residential: false }))}>
                      <span style={{ fontWeight: 700 }}>No</span>
                    </div>
                  </div>
                </div>

                <div className="wcr-field-group">
                  <label className="wcr-label">Offers Clinical Services?</label>
                  <div className="wcr-toggle-group">
                    <div className={`wcr-toggle-card ${formData.offers_clinical ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, offers_clinical: true }))}>
                      <span style={{ fontWeight: 700 }}>Yes</span>
                    </div>
                    <div className={`wcr-toggle-card ${!formData.offers_clinical ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, offers_clinical: false }))}>
                      <span style={{ fontWeight: 700 }}>No</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ margin: '24px 0', borderTop: '1px solid #f1f5f9' }}></div>

              <div className="wcr-category-banner" style={{
                background: formData.category === 'AYUSH Wellness Centre & Hospital'
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                  : formData.category === 'AYUSH Gram or AYUSH Resort'
                    ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                    : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid',
                borderColor: formData.category === 'AYUSH Wellness Centre & Hospital'
                  ? '#86efac'
                  : formData.category === 'AYUSH Gram or AYUSH Resort'
                    ? '#fde68a'
                    : '#bfdbfe',
                borderLeft: '6px solid',
                borderLeftColor: formData.category === 'AYUSH Wellness Centre & Hospital'
                  ? '#16a34a'
                  : formData.category === 'AYUSH Gram or AYUSH Resort'
                    ? '#d97706'
                    : '#2563eb',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                margin: '24px 0'
              }}>
                <div style={{
                  fontWeight: 700,
                  color: formData.category === 'AYUSH Wellness Centre & Hospital'
                    ? '#14532d'
                    : formData.category === 'AYUSH Gram or AYUSH Resort'
                      ? '#78350f'
                      : '#1e3a8a',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px'
                }}>
                  Auto-determined Category:
                </div>
                <div style={{
                  fontWeight: 900,
                  color: formData.category === 'AYUSH Wellness Centre & Hospital'
                    ? '#15803d'
                    : formData.category === 'AYUSH Gram or AYUSH Resort'
                      ? '#b45309'
                      : '#1d4ed8',
                  fontSize: '24px',
                  lineHeight: '1.2',
                  marginBottom: '10px',
                  fontFamily: "'Outfit', 'Inter', sans-serif"
                }}>
                  {formData.category}
                </div>
                <div style={{
                  color: formData.category === 'AYUSH Wellness Centre & Hospital'
                    ? '#166534'
                    : formData.category === 'AYUSH Gram or AYUSH Resort'
                      ? '#92400e'
                      : '#1e40af',
                  fontSize: '12px',
                  lineHeight: 1.4
                }}>
                  Based on your selections for <strong>Residential</strong> and <strong>Clinical</strong> offerings, your category has been locked automatically.
                </div>
              </div>

              <div className="wcr-field-group">
                <label className="wcr-label">Select Services Offered</label>
                <div className="wcr-chip-group">
                  {allServices.map(service => {
                    const isHospitalOnly = hospitalServices.includes(service);
                    const isLocked = isHospitalOnly && formData.category !== 'AYUSH Wellness Centre & Hospital';

                    if (isLocked) return null;

                    return (
                      <button
                        key={service}
                        type="button"
                        className={`wcr-chip-btn ${formData.services_offered.includes(service) ? 'active' : ''}`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Clinical Info */}
          {step === 2 && (
            <div className="wcr-step-pane">
              <div className="wcr-section-title">Section 2: Clinical Information</div>

              {formData.category === 'AYUSH Wellness Therapy Centre' && (
                <div style={{ spaceY: '20px' }}>
                  <div className="wcr-field-group" style={{ marginBottom: '20px' }}>
                    <label className="wcr-label">Is a Doctor Appointed?</label>
                    <select
                      name="doctor_appointed"
                      className="wcr-select"
                      value={formData.doctor_appointed}
                      onChange={(e) => setFormData(prev => ({ ...prev, doctor_appointed: e.target.value === 'true' }))}
                    >
                      <option value="false">No, only Wellness Therapists are appointed</option>
                      <option value="true">Yes, a Doctor is appointed</option>
                    </select>
                  </div>

                  {formData.doctor_appointed && (
                    <div className="wcr-grid-2" style={{ marginBottom: '20px' }}>
                      <div className="wcr-field-group">
                        <label className="wcr-label">Name of Doctor</label>
                        <input type="text" name="doctor_name" placeholder="Dr. ..." className="wcr-input" value={formData.doctor_name} onChange={handleChange} />
                      </div>
                      <div className="wcr-field-group">
                        <label className="wcr-label">Qualification</label>
                        <select name="doctor_qualification" className="wcr-select" value={formData.doctor_qualification} onChange={handleChange}>
                          <option value="">Select Qualification</option>
                          <option value="BAMS with PG Diploma / Degree in Yoga">BAMS with PG Diploma / Degree in Yoga</option>
                          <option value="BAMS with Diploma/PG Degree in Panchakarma">BAMS with Diploma/PG Degree in Panchakarma</option>
                          <option value="BAMS">BAMS</option>
                          <option value="BNYS">BNYS</option>
                        </select>
                      </div>
                      {renderUploadControl('doctor_qual_doc', 'Doctor Qualification Documents', 'Upload PG degree / certificates (PDF)')}
                      <div className="wcr-field-group">
                        <label className="wcr-label">Bhartiya Chikitsa Parishad Registration Number</label>
                        <input type="text" name="bcp_reg_number" className="wcr-input" value={formData.bcp_reg_number} onChange={handleChange} />
                      </div>
                      {renderUploadControl('bcp_reg_doc', 'BCP Registration Document', 'Upload valid BCP Uttarakhand license document')}
                    </div>
                  )}

                  <div className="wcr-category-banner" style={{ background: '#fef3c7', borderColor: '#fde68a', borderLeftColor: '#d97706', color: '#b45309' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px' }}>Mandatory Declarations for Therapy Centres:</div>
                    <div style={{ fontSize: '12px', marginTop: '6px', spaceY: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" name="declaration_board" checked={formData.declaration_board} onChange={handleChange} />
                        I have installed a board in reception saying 'We Don't Provide any Treatment, Only Wellness Services are being Provided' *
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" name="declaration_signboard" checked={formData.declaration_signboard} onChange={handleChange} />
                        I have clearly mentioned in FRONT Signboard in bold text that 'WELLNESS SERVICES ONLY, NO TREATMENT OFFERED' *
                      </label>
                    </div>
                  </div>
                  {renderUploadControl('clinical_affidavit', 'Upload Affidavit Regarding Declarations', 'Upload notarized declaration affidavit as per rules')}
                </div>
              )}

              {formData.category === 'AYUSH Wellness Centre & Hospital' && (
                <div className="wcr-grid-2">
                  <div className="wcr-field-group">
                    <label className="wcr-label">Name of Doctor *</label>
                    <input type="text" name="doctor_name" placeholder="Dr. ..." className="wcr-input" value={formData.doctor_name} onChange={handleChange} required />
                  </div>
                  <div className="wcr-field-group">
                    <label className="wcr-label">Qualification *</label>
                    <select name="doctor_qualification" className="wcr-select" value={formData.doctor_qualification} onChange={handleChange} required>
                      <option value="">Select Qualification</option>
                      <option value="BAMS with PG Diploma / Degree in Yoga">BAMS with PG Diploma / Degree in Yoga</option>
                      <option value="BAMS with Diploma/PG Degree in Panchakarma">BAMS with Diploma/PG Degree in Panchakarma</option>
                      <option value="BAMS">BAMS</option>
                      <option value="BNYS">BNYS</option>
                    </select>
                  </div>
                  {renderUploadControl('doctor_qual_doc', 'Doctor Qualification Documents *', 'Upload PG degree / certificates (PDF)')}
                  <div className="wcr-field-group">
                    <label className="wcr-label">Bhartiya Chikitsa Parishad Registration Number *</label>
                    <input type="text" name="bcp_reg_number" className="wcr-input" value={formData.bcp_reg_number} onChange={handleChange} required />
                  </div>
                  {renderUploadControl('bcp_reg_doc', 'BCP Registration Document *', 'Upload valid BCP Uttarakhand license document')}
                  
                  <div className="wcr-field-group">
                    <label className="wcr-label">Clinical Establishment Act (CEA) Reg. Number *</label>
                    <input type="text" name="cea_reg_number" placeholder="Enter CEA serial registration" className="wcr-input" value={formData.cea_reg_number} onChange={handleChange} required />
                  </div>
                  <div className="wcr-field-group">
                    <label className="wcr-label">CEA Valid Till *</label>
                    <input type="date" name="cea_valid_till" className="wcr-input" value={formData.cea_valid_till} onChange={handleChange} required />
                  </div>
                  {renderUploadControl('cea_reg_certificate', 'CEA Registration Certificate *', 'Upload valid CEA license certificate')}
                </div>
              )}

              {formData.category === 'AYUSH Gram or AYUSH Resort' && (
                <div style={{ spaceY: '20px' }}>
                  <div className="wcr-grid-2" style={{ marginBottom: '20px' }}>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Name of Doctor</label>
                      <input type="text" name="doctor_name" placeholder="Dr. ..." className="wcr-input" value={formData.doctor_name} onChange={handleChange} />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Qualification</label>
                      <select name="doctor_qualification" className="wcr-select" value={formData.doctor_qualification} onChange={handleChange}>
                        <option value="">Select Qualification</option>
                        <option value="BAMS with PG Diploma / Degree in Yoga">BAMS with PG Diploma / Degree in Yoga</option>
                        <option value="BAMS with Diploma/PG Degree in Panchakarma">BAMS with Diploma/PG Degree in Panchakarma</option>
                        <option value="BAMS">BAMS</option>
                        <option value="BNYS">BNYS</option>
                      </select>
                    </div>
                    {renderUploadControl('doctor_qual_doc', 'Doctor Qualification Documents', 'Upload PG degree / certificates (PDF)')}
                    <div className="wcr-field-group">
                      <label className="wcr-label">Bhartiya Chikitsa Parishad Registration Number</label>
                      <input type="text" name="bcp_reg_number" className="wcr-input" value={formData.bcp_reg_number} onChange={handleChange} />
                    </div>
                    {renderUploadControl('bcp_reg_doc', 'BCP Registration Document', 'Upload BCP license document')}
                  </div>

                  <div className="wcr-field-group" style={{ marginBottom: '20px' }}>
                    <label className="wcr-label">Registered under Clinical Establishment Act (CEA)?</label>
                    <select
                      name="cea_registered"
                      className="wcr-select"
                      value={formData.cea_registered}
                      onChange={(e) => setFormData(prev => ({ ...prev, cea_registered: e.target.value === 'true' }))}
                    >
                      <option value="false">No, not registered under CEA</option>
                      <option value="true">Yes, registered under CEA</option>
                    </select>
                  </div>

                  {formData.cea_registered ? (
                    <div className="wcr-grid-2">
                      <div className="wcr-field-group">
                        <label className="wcr-label">CEA Reg. Number</label>
                        <input type="text" name="cea_reg_number" className="wcr-input" value={formData.cea_reg_number} onChange={handleChange} />
                      </div>
                      <div className="wcr-field-group">
                        <label className="wcr-label">CEA Valid Till</label>
                        <input type="date" name="cea_valid_till" className="wcr-input" value={formData.cea_valid_till} onChange={handleChange} />
                      </div>
                      {renderUploadControl('cea_reg_certificate', 'CEA Registration Certificate', 'Upload CEA certificate (PDF)')}
                    </div>
                  ) : (
                    <div style={{ spaceY: '20px' }}>
                      <div className="wcr-category-banner" style={{ background: '#fef3c7', borderColor: '#fde68a', borderLeftColor: '#d97706', color: '#b45309' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px' }}>Mandatory Declarations:</div>
                        <div style={{ fontSize: '12px', marginTop: '6px', spaceY: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" name="declaration_board" checked={formData.declaration_board} onChange={handleChange} />
                            I have installed a board in reception saying 'We Don't Provide any Treatment, Only Wellness Services are being Provided' *
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                            <input type="checkbox" name="declaration_signboard" checked={formData.declaration_signboard} onChange={handleChange} />
                            I have clearly mentioned in FRONT Signboard in bold text that 'WELLNESS SERVICES ONLY, NO TREATMENT OFFERED' *
                          </label>
                        </div>
                      </div>
                      {renderUploadControl('clinical_affidavit', 'Upload Affidavit Regarding Declarations', 'Upload declaration affidavit')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Infrastructure */}
          {step === 3 && (
            <div className="wcr-step-pane">
              <div className="wcr-section-title">Section 3: Infrastructure Details</div>

              <div className="wcr-grid-2">
                <div className="wcr-field-group">
                  <label className="wcr-label">Reception Area (in Sq Feet)</label>
                  <input type="number" name="reception_area_sqft" placeholder="e.g. 150" className="wcr-input" value={formData.reception_area_sqft} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Waiting Capacity (Number of Seats)</label>
                  <input type="number" name="waiting_capacity" placeholder="e.g. 10" className="wcr-input" value={formData.waiting_capacity} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Health Consultation Rooms</label>
                  <input type="number" name="consultation_rooms" placeholder="e.g. 2" className="wcr-input" value={formData.consultation_rooms} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Name of Incharge</label>
                  <input type="text" name="incharge_name" placeholder="Enter name of incharge manager" className="wcr-input" value={formData.incharge_name} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Mobile Number of Incharge</label>
                  <input type="text" name="incharge_mobile" className="wcr-input" value={formData.incharge_mobile} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Emergency Referral Centre Name</label>
                  <input type="text" name="emergency_centre_name" placeholder="e.g. District Civil Hospital" className="wcr-input" value={formData.emergency_centre_name} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Distance of Emergency Referral Centre (in meters)</label>
                  <input type="number" name="emergency_distance_m" placeholder="e.g. 1500" className="wcr-input" value={formData.emergency_distance_m} onChange={handleChange} />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Offer Prakruti Pareekshan to every patient?</label>
                  <select name="offers_prakruti" className="wcr-select" value={formData.offers_prakruti} onChange={e => setFormData(p => ({...p, offers_prakruti: e.target.value === 'true'}))}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Website (Optional)</label>
                  <input type="text" name="website" placeholder="www.example.com" className="wcr-input" value={formData.website} onChange={handleChange} />
                </div>
                {renderUploadControl('service_charges_doc', 'Service Charges List Document *', 'Upload list of all therapies offered with their standard pricing')}
                {renderUploadControl('brochure_doc', 'Brochure (Optional)', 'Upload centre brochure / photos')}
              </div>

              {/* Service-specific Room Counts */}
              <div style={{ margin: '28px 0', borderTop: '1px solid #e2e8f0' }}></div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#334155', marginBottom: '16px' }}>Service Room Configuration</h4>

              <div className="wcr-grid-2">
                {formData.services_offered.includes('Panchakarma') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Abhyanga Rooms (Min. 100 sqft each) *</label>
                      <input type="number" name="abhyanga_rooms" placeholder="Min. 2" className="wcr-input" value={formData.abhyanga_rooms} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Vasti Rooms (Min. 80 sqft + toilet) *</label>
                      <input type="number" name="vasti_rooms" placeholder="Min. 1" className="wcr-input" value={formData.vasti_rooms} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Post Therapy Waiting Rooms *</label>
                      <input type="number" name="post_therapy_waiting_rooms" placeholder="Min. 1" className="wcr-input" value={formData.post_therapy_waiting_rooms} onChange={handleChange} required />
                    </div>
                  </>
                )}

                {formData.services_offered.includes('Ayurveda') && (
                  <div className="wcr-field-group">
                    <label className="wcr-label">Medicine Dispensing Rooms (Min. 100 sqft) *</label>
                    <input type="number" name="medicine_dispensing_rooms" placeholder="Min. 1" className="wcr-input" value={formData.medicine_dispensing_rooms} onChange={handleChange} required />
                  </div>
                )}

                {formData.services_offered.includes('Marma Chikitsa') && (
                  <div className="wcr-field-group">
                    <label className="wcr-label">Marma Chikitsa Rooms (Min. 100 sqft) *</label>
                    <input type="number" name="marma_rooms" placeholder="Min. 1" className="wcr-input" value={formData.marma_rooms} onChange={handleChange} required />
                  </div>
                )}

                {(formData.services_offered.includes('Siravedha & Leech Therapy') ||
                  formData.services_offered.includes('Agni Karma') ||
                  formData.services_offered.includes('Kshar Karma')) && (
                  <div className="wcr-field-group">
                    <label className="wcr-label">Para Surgical Therapy Rooms *</label>
                    <input type="number" name="para_surgical_rooms" placeholder="Min. 1" className="wcr-input" value={formData.para_surgical_rooms} onChange={handleChange} required />
                  </div>
                )}

                {formData.services_offered.includes('Kshar Sutra') && (
                  <div className="wcr-field-group">
                    <label className="wcr-label">Kshar Sutra Minor OT *</label>
                    <input type="number" name="kshar_sutra_ot" placeholder="Min. 1" className="wcr-input" value={formData.kshar_sutra_ot} onChange={handleChange} required />
                  </div>
                )}

                {formData.services_offered.includes('Yoga') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Yoga Halls (Min. 350 sqft) *</label>
                      <input type="number" name="yoga_halls" placeholder="Min. 1" className="wcr-input" value={formData.yoga_halls} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Meditation Halls (Min. 150 sqft) *</label>
                      <input type="number" name="meditation_halls" placeholder="Min. 1" className="wcr-input" value={formData.meditation_halls} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Shatkarma Rooms (with sink) *</label>
                      <input type="number" name="shatkarma_rooms" placeholder="Min. 1" className="wcr-input" value={formData.shatkarma_rooms} onChange={handleChange} required />
                    </div>
                  </>
                )}

                {formData.services_offered.includes('Naturopathy') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Naturopathy Massage Rooms (Min. 100 sqft) *</label>
                      <input type="number" name="massage_rooms" placeholder="Min. 2" className="wcr-input" value={formData.massage_rooms} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Enema Rooms (Min. 80 sqft + toilet) *</label>
                      <input type="number" name="enema_rooms" placeholder="Min. 1" className="wcr-input" value={formData.enema_rooms} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Hydrotherapy Rooms (Min. 150 sqft) *</label>
                      <input type="number" name="hydrotherapy_rooms" placeholder="Min. 1" className="wcr-input" value={formData.hydrotherapy_rooms} onChange={handleChange} required />
                    </div>
                  </>
                )}
              </div>

              {/* Conditional Clinical Facility Details */}
              {formData.offers_clinical && formData.category !== 'AYUSH Wellness Therapy Centre' && (
                <>
                  <div style={{ margin: '28px 0', borderTop: '1px solid #e2e8f0' }}></div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#334155', marginBottom: '16px' }}>Clinical / IPD Infrastructure</h4>

                  <div className="wcr-grid-2">
                    <div className="wcr-field-group">
                      <label className="wcr-label">Number of IPD Beds</label>
                      <input type="number" name="num_beds" className="wcr-input" value={formData.num_beds} onChange={handleChange} />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">In-House Kitchen Available?</label>
                      <select name="kitchen_available" className="wcr-select" value={formData.kitchen_available} onChange={e => setFormData(p => ({...p, kitchen_available: e.target.value === 'true'}))}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Offer Dosha Based Dietetics?</label>
                      <select name="dosha_dietetics" className="wcr-select" value={formData.dosha_dietetics} onChange={e => setFormData(p => ({...p, dosha_dietetics: e.target.value === 'true'}))}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Parking Space (Number of Cars)</label>
                      <input type="number" name="parking_cars" className="wcr-input" value={formData.parking_cars} onChange={handleChange} />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Premises CCTV Supervised?</label>
                      <select name="cctv_supervised" className="wcr-select" value={formData.cctv_supervised} onChange={e => setFormData(p => ({...p, cctv_supervised: e.target.value === 'true'}))}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Staff Details */}
          {step === 4 && (
            <div className="wcr-step-pane">
              <div className="wcr-section-title">Section 4: Additional Staff Details</div>

              <div className="wcr-grid-2">
                <div className="wcr-field-group">
                  <label className="wcr-label">Receptionist Count (Min. 1) *</label>
                  <input type="number" name="receptionist_count" placeholder="Min. 1" className="wcr-input" value={formData.receptionist_count} onChange={handleChange} required />
                </div>
                <div className="wcr-field-group">
                  <label className="wcr-label">Sanitation Worker Count (Min. 1) *</label>
                  <input type="number" name="sanitation_worker_count" placeholder="Min. 1" className="wcr-input" value={formData.sanitation_worker_count} onChange={handleChange} required />
                </div>

                {(formData.category === 'AYUSH Wellness Centre & Hospital' || formData.category === 'AYUSH Gram or AYUSH Resort') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Multi-Purpose Workers (MPW) *</label>
                      <input type="number" name="mpw_count" placeholder="Min. 1 per 10 beds" className="wcr-input" value={formData.mpw_count} onChange={handleChange} required />
                      <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(1, Math.ceil(parseInt(formData.num_beds) / 10)) : 1}</span>
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Cook Count *</label>
                      <input type="number" name="cook_count" placeholder="Min. 1" className="wcr-input" value={formData.cook_count} onChange={handleChange} required />
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Watchman / Guard Count *</label>
                      <input type="number" name="watchman_count" placeholder="Min. 1" className="wcr-input" value={formData.watchman_count} onChange={handleChange} required />
                    </div>
                  </>
                )}

                {/* Conditional Staff based on services */}
                {(formData.category === 'AYUSH Wellness Therapy Centre' || formData.category === 'AYUSH Gram or AYUSH Resort') &&
                  formData.services_offered.includes('Ayurveda') && (
                    <>
                      <div className="wcr-field-group">
                        <label className="wcr-label">Pharmacist Name *</label>
                        <input type="text" name="pharmacist_name" className="wcr-input" value={formData.pharmacist_name} onChange={handleChange} required />
                      </div>
                      <div className="wcr-field-group">
                        <label className="wcr-label">Pharmacist BCP Reg. Number *</label>
                        <input type="text" name="pharmacist_reg_number" className="wcr-input" value={formData.pharmacist_reg_number} onChange={handleChange} required />
                      </div>
                      {renderUploadControl('pharmacist_bcp_doc', 'Pharmacist BCP License Doc *', 'Upload valid BCP registration license')}
                      {formData.is_residential && (
                        <>
                          <div className="wcr-field-group">
                            <label className="wcr-label">Wellness Centre Attendant Count *</label>
                            <input type="number" name="wc_attendant_count" placeholder="Min. 2 per 10 beds" className="wcr-input" value={formData.wc_attendant_count} onChange={handleChange} required />
                            <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(2, Math.ceil(parseInt(formData.num_beds) / 10) * 2) : 2}</span>
                          </div>
                          <div className="wcr-field-group">
                            <label className="wcr-label">Ayurveda Nurse Count *</label>
                            <input type="number" name="ayurveda_nurse_count" placeholder="Min. 2 per 10 beds" className="wcr-input" value={formData.ayurveda_nurse_count} onChange={handleChange} required />
                            <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(2, Math.ceil(parseInt(formData.num_beds) / 10) * 2) : 2}</span>
                          </div>
                        </>
                      )}
                    </>
                )}

                {formData.services_offered.includes('Panchakarma') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Male Panchakarma Therapists *</label>
                      <input type="number" name="male_panchakarma_therapist" placeholder="Min. 1" className="wcr-input" value={formData.male_panchakarma_therapist} onChange={handleChange} required />
                      <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(1, Math.ceil(parseInt(formData.num_beds) / 10)) : 1}</span>
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Female Panchakarma Therapists *</label>
                      <input type="number" name="female_panchakarma_therapist" placeholder="Min. 1" className="wcr-input" value={formData.female_panchakarma_therapist} onChange={handleChange} required />
                      <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(1, Math.ceil(parseInt(formData.num_beds) / 10)) : 1}</span>
                    </div>
                    {renderUploadControl('panchakarma_staff_bcp_doc', 'Panchakarma Staff BCP Registrations *', 'Upload combined BCP documents of all therapists')}
                  </>
                )}

                {formData.services_offered.includes('Yoga') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Yoga Instructors Count *</label>
                      <input type="number" name="yoga_instructor_count" placeholder="Min. 1" className="wcr-input" value={formData.yoga_instructor_count} onChange={handleChange} required />
                    </div>
                    {renderUploadControl('yoga_instructor_qual_doc', 'Yoga Instructor Qualification Docs *', 'Upload degree/certificates in Yoga sciences')}
                  </>
                )}

                {formData.services_offered.includes('Naturopathy') && (
                  <>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Naturopathy BNYS Doctor Name *</label>
                      <input type="text" name="bnys_doctor_name" placeholder="Dr. ..." className="wcr-input" value={formData.bnys_doctor_name} onChange={handleChange} required />
                    </div>
                    {renderUploadControl('bnys_reg_certificate', 'BNYS Registration Certificate *', 'Upload valid BNYS degree certificate')}
                    <div className="wcr-field-group">
                      <label className="wcr-label">Male Yog & Naturopathy Attendants *</label>
                      <input type="number" name="male_naturopathy_attendant" placeholder="Min. 1" className="wcr-input" value={formData.male_naturopathy_attendant} onChange={handleChange} required />
                      <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(1, Math.ceil(parseInt(formData.num_beds) / 10)) : 1}</span>
                    </div>
                    <div className="wcr-field-group">
                      <label className="wcr-label">Female Yog & Naturopathy Attendants *</label>
                      <input type="number" name="female_naturopathy_attendant" placeholder="Min. 1" className="wcr-input" value={formData.female_naturopathy_attendant} onChange={handleChange} required />
                      <span className="wcr-field-hint">Auto-calculated minimum: {formData.num_beds ? Math.max(1, Math.ceil(parseInt(formData.num_beds) / 10)) : 1}</span>
                    </div>
                    {renderUploadControl('naturopathy_staff_bcp_doc', 'Upload Naturopathy Attendants BCP Registrations *', 'Upload combined BCP documents of all Naturopathy staff')}
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Fee & Declarations */}
          {step === 5 && (
            <div className="wcr-step-pane">
              <div className="wcr-section-title">Section 5: Fee & Declarations</div>

              <div className="wcr-category-banner" style={{ background: '#f0fdf4', borderColor: '#86efac', borderLeftColor: '#16a34a', color: '#166534', marginBottom: '24px' }}>
                <div style={{ fontWeight: 800, fontSize: '13px' }}>Fee Verification:</div>
                <div style={{ fontSize: '12px', marginTop: '6px' }}>
                  A standard processing fee of **₹200** must be deposited to the treasury. Upload receipt of transfer.
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '12px', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    name="fee_deposited"
                    checked={formData.fee_deposited}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee_deposited: e.target.checked }))}
                  />
                  I have deposited the processing fee of ₹200 *
                </label>
              </div>

              {formData.fee_deposited && renderUploadControl('fee_receipt_doc', 'Processing Fee Receipt *', 'Upload Challan / payment transaction receipt')}
              {renderUploadControl('declaration_affidavit', 'Upload Notarized Affidavit for Declarations *', 'Upload combined affidavit certificate (PDF)')}

              <div style={{ margin: '28px 0', borderTop: '1px solid #e2e8f0' }}></div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#334155', marginBottom: '16px' }}>Mandatory Compliance Declarations</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#475569' }}>
                {[
                  'All wellness services available at our centre are clearly displayed at reception or website.',
                  'A daily visitors attendance ledger is maintained and available for department audits.',
                  'We only offer therapies under our approved category and services array.',
                  'We will obtain Clinical Establishment Act (CEA) license if clinical procedures are offered.',
                  'Single-use materials and fresh oils are strictly used per person. Reusing is prohibited.',
                  'The premise is clean, hygienic, and sanitized regularly.',
                  'Biomedical waste is safely segregated and disposed of per pollution control board rules.',
                  'Cross Massage is strictly prohibited. Disclaimers are displayed prominently.',
                  'Emergency contact list and referral guidelines are available at the front desk.',
                  'All therapists and workers wear uniforms with a visible identity name tag.',
                  'A physical complaint and suggestion box is installed in the lobby.',
                  'Therapy rates, timings, and procedures list are transparently posted.',
                  'Proper sterilization equipment (autoclave/disinfectant sprays) is installed.',
                  'All food products/supplements served are certified by FSSAI, GMP or organically self-grown.',
                  'Fire safety extinguisher with valid AMC is installed.',
                  'Separate therapy rooms/cabins for Male and Female clients are available.',
                  'A soft/hard copy of prescribed wellness routine is given to every client.',
                  'We maintain the therapist credentials files on premise.'
                ].map((decText, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', lineHeight: 1.4 }}>
                    <input
                      type="checkbox"
                      name={`dec_${idx + 1}`}
                      checked={formData[`dec_${idx + 1}`]}
                      onChange={handleChange}
                      style={{ marginTop: '2px' }}
                    />
                    <span>{idx + 1}. {decText} *</span>
                  </label>
                ))}

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e40af', marginTop: '16px', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    name="dec_final"
                    checked={formData.dec_final}
                    onChange={handleChange}
                    style={{ marginTop: '3px' }}
                  />
                  <span>I hereby declare that all information provided in the application is true, accurate, and correct. I understand that any false declarations may lead to instant cancellation of my operational registration. *</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="wcr-footer">
          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 1 && (
              <button className="wcr-btn wcr-btn-secondary" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button className="wcr-btn wcr-btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {step < 5 ? (
              <button className="wcr-btn wcr-btn-primary" onClick={handleNext}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="wcr-btn wcr-btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                style={{ opacity: (!canSubmit || isSubmitting) ? 0.5 : 1, cursor: (!canSubmit || isSubmitting) ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Submitting Registration...' : '✓ Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
