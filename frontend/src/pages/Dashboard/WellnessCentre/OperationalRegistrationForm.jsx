import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';

export default function OperationalRegistrationForm({ isOpen, onClose, onSuccess, user }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    already_registered: false,
    registration_reason: '',
    previous_registration_number: '',
    centre_name: '',
    district: '',
    address: '',
    gps_lat: '',
    gps_long: '',
    google_map_link: '',
    owner_name: '',
    mobile_number: '',
    is_residential: false,
    offers_clinical: false,
    category: 'AYUSH Wellness Therapy Centre',
    services: [], // array of strings
    
    // Clinical info
    is_doctor_appointed: false,
    doctor_name: '',
    doctor_qualification: '',
    bcp_registration_number: '',
    declaration_board_a: false,
    declaration_board_b: false,
    cea_registration_number: '',
    cea_valid_till: '',
    cea_registered: false,

    // Infra
    reception_area: '',
    waiting_area_capacity: '',
    consultation_rooms: '',
    incharge_name: '',
    incharge_mobile: '',
    referral_centre_name: '',
    referral_centre_distance: '',
    prakruti_pareekshan: false,
    website: '',
    
    abhyanga_room: '',
    vasti_room: '',
    post_therapy_room: '',
    medicine_dispensing_room: '',
    marma_chikitsa_room: '',
    para_surgical_room: '',
    kshar_sutra_ot: '',
    yoga_hall: '',
    meditation_hall: '',
    shatkarma_room: '',
    massage_room: '',
    enema_room: '',
    hydrotherapy_room: '',
    
    number_of_beds: '',
    inhouse_kitchen: false,
    dosha_based_dietetics: false,
    parking_space: '',
    cctv_supervised: false,

    // Staff
    receptionist_count: '',
    sanitation_worker_count: '',
    mpw_count: '',
    cook_count: '',
    watchman_count: '',
    pharmacist_name: '',
    pharmacist_reg_number: '',
    wellness_attendant_count: '',
    ayurveda_nurse_count: '',
    male_panchakarma_therapist: '',
    female_panchakarma_therapist: '',
    yoga_instructor_count: '',
    bnys_doctor_name: '',
    male_naturopathy_attendant: '',
    female_naturopathy_attendant: '',

    // Declaration
    fee_deposited: false,
    dec_1: false, dec_2: false, dec_3: false, dec_4: false, dec_5: false,
    dec_6: false, dec_7: false, dec_8: false, dec_9: false, dec_10: false,
    dec_11: false, dec_12: false, dec_13: false, dec_14: false, dec_15: false,
    dec_16: false, dec_17: false, dec_18: false, dec_final: false
  });

  // Files State
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        owner_name: user.full_name || '',
        mobile_number: user.phone || '',
        district: user.district || ''
      }));
    }
  }, [user]);

  // Category Logic
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
      let currentServices = [...prev.services];
      if (newCat !== 'AYUSH Wellness Centre & Hospital') {
        const hospitalOnly = ['Ayurveda', 'Kshar Sutra', 'Kshar Karma', 'Siravedha & Leech Therapy', 'Agni Karma', 'Marma Chikitsa'];
        currentServices = currentServices.filter(s => !hospitalOnly.includes(s));
      }
      return { ...prev, category: newCat, services: currentServices };
    });
  }, [formData.is_residential, formData.offers_clinical]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    } else {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[name];
        return newFiles;
      });
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const exists = prev.services.includes(service);
      if (exists) {
        return { ...prev, services: prev.services.filter(s => s !== service) };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  const districts = ['Dehradun', 'Haridwar', 'Tehri Garhwal', 'Pauri Garhwal', 'Chamoli', 'Rudraprayag', 'Uttarkashi', 'Pithoragarh', 'Bageshwar', 'Almora', 'Champawat', 'Nainital', 'Udham Singh Nagar'];
  
  const allServices = ['Yoga', 'Naturopathy', 'Panchakarma', 'Ayurveda', 'Kshar Sutra', 'Kshar Karma', 'Siravedha & Leech Therapy', 'Agni Karma', 'Marma Chikitsa'];
  const hospitalServices = ['Ayurveda', 'Kshar Sutra', 'Kshar Karma', 'Siravedha & Leech Therapy', 'Agni Karma', 'Marma Chikitsa'];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'services') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key].toString());
      }
    });

    Object.keys(files).forEach(key => {
      submitData.append(key, files[key]);
    });

    try {
      const res = await axiosInstance.post('/api/wellness/operational-registration', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setIsSubmitting(false);
      onSuccess(res.data?.registration_number || 'REG-SUCCESS');
    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    }
  };

  if (!isOpen) return null;

  const allDeclarationsChecked = Array.from({ length: 18 }, (_, i) => formData[`dec_${i + 1}`]).every(val => val) && formData.dec_final;
  const canSubmit = formData.fee_deposited && allDeclarationsChecked;

  return (
    <div className="ow-modal-overlay">
      <div className="ow-modal-content">
        <div className="ow-modal-header">
          <h2>Operational Registration Form</h2>
          <button className="ow-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="ow-progress-bar-container">
          <div className="ow-progress-bar" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
        <div className="ow-step-indicator">Step {step} of 5</div>

        <div className="ow-scrollable-area">
          {error && <div className="ow-error-msg">{error}</div>}
          
          {/* SECTION 1 */}
          {step === 1 && (
            <div className="ow-section">
              <h3>Section 1: General Information</h3>
              
              <div className="ow-field-group">
                <label>Is your Centre Already Registered on Apuni Sarkar or AYUSH Setu Portal?</label>
                <select name="already_registered" value={formData.already_registered} onChange={e => setFormData({...formData, already_registered: e.target.value === 'true'})}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {formData.already_registered && (
                <>
                  <div className="ow-field-group">
                    <label>Reason for Registration</label>
                    <select name="registration_reason" value={formData.registration_reason} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="Renewal">Renewal</option>
                      <option value="Migration">Migration</option>
                    </select>
                  </div>
                  <div className="ow-field-group">
                    <label>Previous Registration Number</label>
                    <input type="text" name="previous_registration_number" value={formData.previous_registration_number} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Upload Previous Registration Certificate</label>
                    <input type="file" name="file_previous_certificate" onChange={handleFileChange} />
                  </div>
                </>
              )}

              <div className="ow-field-group">
                <label>Centre Name *</label>
                <input type="text" name="centre_name" value={formData.centre_name} onChange={handleChange} required />
              </div>
              <div className="ow-field-group">
                <label>District *</label>
                <select name="district" value={formData.district} onChange={handleChange} required>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="ow-field-group">
                <label>Full Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required rows="3"></textarea>
              </div>
              <div className="ow-row">
                <div className="ow-field-group">
                  <label>GPS Latitude</label>
                  <input type="text" name="gps_lat" value={formData.gps_lat} onChange={handleChange} />
                </div>
                <div className="ow-field-group">
                  <label>GPS Longitude</label>
                  <input type="text" name="gps_long" value={formData.gps_long} onChange={handleChange} />
                </div>
              </div>
              <div className="ow-field-group">
                <label>Google Map Link</label>
                <input type="text" name="google_map_link" value={formData.google_map_link} onChange={handleChange} />
              </div>
              <div className="ow-field-group">
                <label>Name of Owner</label>
                <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} />
              </div>
              <div className="ow-field-group">
                <label>Mobile Number</label>
                <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} />
              </div>

              <div className="ow-field-group">
                <label>Is the Centre Residential Type?</label>
                <select name="is_residential" value={formData.is_residential} onChange={e => setFormData({...formData, is_residential: e.target.value === 'true'})}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="ow-field-group">
                <label>Does Centre Offer Clinical Services?</label>
                <select name="offers_clinical" value={formData.offers_clinical} onChange={e => setFormData({...formData, offers_clinical: e.target.value === 'true'})}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              <div className="ow-category-display">
                <h4>Assigned Category</h4>
                <div className="ow-cat-card">{formData.category}</div>
                <small className="ow-hint">This is auto-selected based on your Residential and Clinical selections.</small>
              </div>

              <div className="ow-field-group">
                <label>Services Offered</label>
                <div className="ow-chips">
                  {allServices.map(service => {
                    const isHospitalOnly = hospitalServices.includes(service);
                    const disabled = isHospitalOnly && formData.category !== 'AYUSH Wellness Centre & Hospital';
                    const selected = formData.services.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        className={`ow-chip ${selected ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={() => !disabled && handleServiceToggle(service)}
                        disabled={disabled}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 2 */}
          {step === 2 && (
            <div className="ow-section">
              <h3>Section 2: Clinical Information</h3>
              
              {formData.category === 'AYUSH Wellness Therapy Centre' && (
                <>
                  <div className="ow-field-group">
                    <label>Is Doctor Appointed?</label>
                    <select name="is_doctor_appointed" value={formData.is_doctor_appointed} onChange={e => setFormData({...formData, is_doctor_appointed: e.target.value === 'true'})}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  {formData.is_doctor_appointed && (
                    <>
                      <div className="ow-field-group">
                        <label>Name of Doctor</label>
                        <input type="text" name="doctor_name" value={formData.doctor_name} onChange={handleChange} />
                      </div>
                      <div className="ow-field-group">
                        <label>Qualification</label>
                        <select name="doctor_qualification" value={formData.doctor_qualification} onChange={handleChange}>
                          <option value="">Select...</option>
                          <option value="BAMS with PG Diploma / Degree in Yoga">BAMS with PG Diploma / Degree in Yoga</option>
                          <option value="BAMS with Diploma/PG Degree in Panchakarma">BAMS with Diploma/PG Degree in Panchakarma</option>
                          <option value="BAMS">BAMS</option>
                          <option value="BNYS">BNYS</option>
                          <option value="BAMS with MD or MS">BAMS with MD or MS</option>
                        </select>
                      </div>
                      <div className="ow-field-group">
                        <label>Upload Qualification Documents</label>
                        <input type="file" name="file_qualification" onChange={handleFileChange} />
                      </div>
                      <div className="ow-field-group">
                        <label>Bhartiya Chikitsa Parishad Registration Number</label>
                        <input type="text" name="bcp_registration_number" value={formData.bcp_registration_number} onChange={handleChange} />
                      </div>
                      <div className="ow-field-group">
                        <label>Upload Registration Document</label>
                        <input type="file" name="file_bcp_reg" onChange={handleFileChange} />
                      </div>
                    </>
                  )}
                  <div className="ow-checkbox-group">
                    <label><input type="checkbox" name="declaration_board_a" checked={formData.declaration_board_a} onChange={handleChange} /> I have installed a board in reception saying 'We Don't Provide any Treatment, Only Wellness Services are being Provided'</label>
                    <label><input type="checkbox" name="declaration_board_b" checked={formData.declaration_board_b} onChange={handleChange} /> I have clearly mentioned in FRONT Signboard in bold text that 'WELLNESS SERVICES ONLY, NO TREATMENT OFFERED'</label>
                  </div>
                  <div className="ow-field-group">
                    <label>Upload Affidavit Regarding Declaration</label>
                    <input type="file" name="file_affidavit_dec" onChange={handleFileChange} />
                  </div>
                </>
              )}

              {formData.category === 'AYUSH Wellness Centre & Hospital' && (
                <>
                  <div className="ow-field-group">
                    <label>Name of Doctor *</label>
                    <input type="text" name="doctor_name" value={formData.doctor_name} onChange={handleChange} required />
                  </div>
                  <div className="ow-field-group">
                    <label>Qualification</label>
                    <select name="doctor_qualification" value={formData.doctor_qualification} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="BAMS with PG Diploma / Degree in Yoga">BAMS with PG Diploma / Degree in Yoga</option>
                      <option value="BAMS with Diploma/PG Degree in Panchakarma">BAMS with Diploma/PG Degree in Panchakarma</option>
                      <option value="BAMS">BAMS</option>
                      <option value="BNYS">BNYS</option>
                      <option value="BAMS with MD or MS">BAMS with MD or MS</option>
                    </select>
                  </div>
                  <div className="ow-field-group">
                    <label>Upload Qualification Documents</label>
                    <input type="file" name="file_qualification" onChange={handleFileChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Bhartiya Chikitsa Parishad Registration Number</label>
                    <input type="text" name="bcp_registration_number" value={formData.bcp_registration_number} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Upload BCP Registration Document</label>
                    <input type="file" name="file_bcp_reg" onChange={handleFileChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>CEA Registration Number</label>
                    <input type="text" name="cea_registration_number" value={formData.cea_registration_number} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>CEA Valid Till</label>
                    <input type="date" name="cea_valid_till" value={formData.cea_valid_till} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Upload CEA Registration Certificate</label>
                    <input type="file" name="file_cea_cert" onChange={handleFileChange} />
                  </div>
                </>
              )}

              {formData.category === 'AYUSH Gram or AYUSH Resort' && (
                <>
                  <div className="ow-field-group">
                    <label>Name of Doctor</label>
                    <input type="text" name="doctor_name" value={formData.doctor_name} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Qualification</label>
                    <select name="doctor_qualification" value={formData.doctor_qualification} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="BAMS with PG Diploma / Degree in Yoga">BAMS with PG Diploma / Degree in Yoga</option>
                      <option value="BAMS with Diploma/PG Degree in Panchakarma">BAMS with Diploma/PG Degree in Panchakarma</option>
                      <option value="BAMS">BAMS</option>
                      <option value="BNYS">BNYS</option>
                      <option value="BAMS with MD or MS">BAMS with MD or MS</option>
                    </select>
                  </div>
                  <div className="ow-field-group">
                    <label>Upload Qualification Documents</label>
                    <input type="file" name="file_qualification" onChange={handleFileChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Bhartiya Chikitsa Parishad Registration Number</label>
                    <input type="text" name="bcp_registration_number" value={formData.bcp_registration_number} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Upload BCP Registration Document</label>
                    <input type="file" name="file_bcp_reg" onChange={handleFileChange} />
                  </div>
                  
                  <div className="ow-field-group">
                    <label>Have you registered under Clinical Establishment Act?</label>
                    <select name="cea_registered" value={formData.cea_registered} onChange={e => setFormData({...formData, cea_registered: e.target.value === 'true'})}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  
                  {formData.cea_registered ? (
                    <>
                      <div className="ow-field-group">
                        <label>CEA Registration Number</label>
                        <input type="text" name="cea_registration_number" value={formData.cea_registration_number} onChange={handleChange} />
                      </div>
                      <div className="ow-field-group">
                        <label>CEA Valid Till</label>
                        <input type="date" name="cea_valid_till" value={formData.cea_valid_till} onChange={handleChange} />
                      </div>
                      <div className="ow-field-group">
                        <label>Upload CEA Registration Certificate</label>
                        <input type="file" name="file_cea_cert" onChange={handleFileChange} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ow-checkbox-group">
                        <label><input type="checkbox" name="declaration_board_a" checked={formData.declaration_board_a} onChange={handleChange} /> I have installed a board in reception saying 'We Don't Provide any Treatment, Only Wellness Services are being Provided'</label>
                        <label><input type="checkbox" name="declaration_board_b" checked={formData.declaration_board_b} onChange={handleChange} /> I have clearly mentioned in FRONT Signboard in bold text that 'WELLNESS SERVICES ONLY, NO TREATMENT OFFERED'</label>
                      </div>
                      <div className="ow-field-group">
                        <label>Upload Affidavit Regarding Declaration</label>
                        <input type="file" name="file_affidavit_dec" onChange={handleFileChange} />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* SECTION 3 */}
          {step === 3 && (
            <div className="ow-section">
              <h3>Section 3: Infrastructure Details</h3>
              <div className="ow-row">
                <div className="ow-field-group">
                  <label>Reception Area (Sq Ft)</label>
                  <input type="number" name="reception_area" value={formData.reception_area} onChange={handleChange} />
                </div>
                <div className="ow-field-group">
                  <label>Waiting Area Seating Capacity</label>
                  <input type="number" name="waiting_area_capacity" value={formData.waiting_area_capacity} onChange={handleChange} />
                </div>
              </div>
              <div className="ow-field-group">
                <label>Health Consultation Rooms</label>
                <input type="number" name="consultation_rooms" value={formData.consultation_rooms} onChange={handleChange} />
              </div>
              <div className="ow-row">
                <div className="ow-field-group">
                  <label>Name of Incharge</label>
                  <input type="text" name="incharge_name" value={formData.incharge_name} onChange={handleChange} />
                </div>
                <div className="ow-field-group">
                  <label>Mobile Number of Incharge</label>
                  <input type="text" name="incharge_mobile" value={formData.incharge_mobile} onChange={handleChange} />
                </div>
              </div>
              <div className="ow-row">
                <div className="ow-field-group">
                  <label>Emergency Referral Centre Name</label>
                  <input type="text" name="referral_centre_name" value={formData.referral_centre_name} onChange={handleChange} />
                </div>
                <div className="ow-field-group">
                  <label>Distance of Emergency Referral Centre (m)</label>
                  <input type="number" name="referral_centre_distance" value={formData.referral_centre_distance} onChange={handleChange} />
                </div>
              </div>
              <div className="ow-field-group">
                <label>Do you offer Prakruti Pareekshan to every patient?</label>
                <select name="prakruti_pareekshan" value={formData.prakruti_pareekshan} onChange={e => setFormData({...formData, prakruti_pareekshan: e.target.value === 'true'})}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="ow-field-group">
                <label>Website (optional)</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} />
              </div>
              <div className="ow-row">
                <div className="ow-field-group">
                  <label>Upload Service Charges List</label>
                  <input type="file" name="file_service_charges" onChange={handleFileChange} />
                </div>
                <div className="ow-field-group">
                  <label>Upload Brochure (optional)</label>
                  <input type="file" name="file_brochure" onChange={handleFileChange} />
                </div>
              </div>

              {formData.services.includes('Panchakarma') && (
                <>
                  <div className="ow-sub-section-title">Panchakarma Infrastructure</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Abhyanga Room (min 2)</label>
                      <input type="number" name="abhyanga_room" value={formData.abhyanga_room} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Vasti Room (min 1)</label>
                      <input type="number" name="vasti_room" value={formData.vasti_room} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Post Therapy Waiting Room (min 1)</label>
                      <input type="number" name="post_therapy_room" value={formData.post_therapy_room} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}
              
              {formData.services.includes('Ayurveda') && (
                <div className="ow-field-group">
                  <label>Medicine Dispensing Room (min 1)</label>
                  <input type="number" name="medicine_dispensing_room" value={formData.medicine_dispensing_room} onChange={handleChange} />
                </div>
              )}

              {formData.services.includes('Marma Chikitsa') && (
                <div className="ow-field-group">
                  <label>Marma Chikitsa Room (min 1)</label>
                  <input type="number" name="marma_chikitsa_room" value={formData.marma_chikitsa_room} onChange={handleChange} />
                </div>
              )}

              {(formData.services.includes('Siravedha & Leech Therapy') || formData.services.includes('Agni Karma') || formData.services.includes('Kshar Karma')) && (
                <div className="ow-field-group">
                  <label>Para Surgical Room (min 1)</label>
                  <input type="number" name="para_surgical_room" value={formData.para_surgical_room} onChange={handleChange} />
                </div>
              )}

              {formData.services.includes('Kshar Sutra') && (
                <div className="ow-field-group">
                  <label>Kshar Sutra OT (min 1)</label>
                  <input type="number" name="kshar_sutra_ot" value={formData.kshar_sutra_ot} onChange={handleChange} />
                </div>
              )}

              {formData.services.includes('Yoga') && (
                <>
                  <div className="ow-sub-section-title">Yoga Infrastructure</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Yoga Hall (min 1)</label>
                      <input type="number" name="yoga_hall" value={formData.yoga_hall} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Meditation Hall (min 1)</label>
                      <input type="number" name="meditation_hall" value={formData.meditation_hall} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Shatkarma Room (min 1)</label>
                      <input type="number" name="shatkarma_room" value={formData.shatkarma_room} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}

              {formData.services.includes('Naturopathy') && (
                <>
                  <div className="ow-sub-section-title">Naturopathy Infrastructure</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Massage Room (min 2)</label>
                      <input type="number" name="massage_room" value={formData.massage_room} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Enema Room (min 1)</label>
                      <input type="number" name="enema_room" value={formData.enema_room} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Hydro/Colour/Mud Therapy Room (min 1)</label>
                      <input type="number" name="hydrotherapy_room" value={formData.hydrotherapy_room} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}

              {formData.offers_clinical && formData.category !== 'AYUSH Wellness Therapy Centre' && (
                <>
                  <div className="ow-sub-section-title">Clinical Operations Info</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Number of beds</label>
                      <input type="number" name="number_of_beds" value={formData.number_of_beds} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Parking space for Cars</label>
                      <input type="number" name="parking_space" value={formData.parking_space} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="ow-field-group">
                    <label>In-House Kitchen Available?</label>
                    <select name="inhouse_kitchen" value={formData.inhouse_kitchen} onChange={e => setFormData({...formData, inhouse_kitchen: e.target.value === 'true'})}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div className="ow-field-group">
                    <label>Does centre offer Dosha Based Dietetics?</label>
                    <select name="dosha_based_dietetics" value={formData.dosha_based_dietetics} onChange={e => setFormData({...formData, dosha_based_dietetics: e.target.value === 'true'})}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div className="ow-field-group">
                    <label>Is the premise CCTV Supervised?</label>
                    <select name="cctv_supervised" value={formData.cctv_supervised} onChange={e => setFormData({...formData, cctv_supervised: e.target.value === 'true'})}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </>
              )}

            </div>
          )}

          {/* SECTION 4 */}
          {step === 4 && (
            <div className="ow-section">
              <h3>Section 4: Additional Staff</h3>
              
              <div className="ow-row">
                <div className="ow-field-group">
                  <label>Receptionist Count (min 1)</label>
                  <input type="number" name="receptionist_count" value={formData.receptionist_count} onChange={handleChange} />
                </div>
                <div className="ow-field-group">
                  <label>Sanitation Worker Count (min 1)</label>
                  <input type="number" name="sanitation_worker_count" value={formData.sanitation_worker_count} onChange={handleChange} />
                </div>
              </div>

              {(formData.category === 'AYUSH Wellness Therapy Centre' || formData.category === 'AYUSH Gram or AYUSH Resort') && (
                <div className="ow-row">
                  <div className="ow-field-group">
                    <label>MPW Count</label>
                    <input type="number" name="mpw_count" value={formData.mpw_count} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Cook Count</label>
                    <input type="number" name="cook_count" value={formData.cook_count} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Watchman Count</label>
                    <input type="number" name="watchman_count" value={formData.watchman_count} onChange={handleChange} />
                  </div>
                </div>
              )}

              {(formData.category === 'AYUSH Wellness Therapy Centre' || formData.category === 'AYUSH Gram or AYUSH Resort') && formData.services.includes('Ayurveda') && (
                <>
                  <div className="ow-sub-section-title">Ayurveda Staff</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Pharmacist Name</label>
                      <input type="text" name="pharmacist_name" value={formData.pharmacist_name} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Pharmacist Reg Number</label>
                      <input type="text" name="pharmacist_reg_number" value={formData.pharmacist_reg_number} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Upload BCP Reg Doc</label>
                      <input type="file" name="file_pharmacist_doc" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Wellness Centre Attendant count</label>
                      <input type="number" name="wellness_attendant_count" value={formData.wellness_attendant_count} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Ayurveda Nurse count</label>
                      <input type="number" name="ayurveda_nurse_count" value={formData.ayurveda_nurse_count} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}

              {formData.services.includes('Panchakarma') && (
                <>
                  <div className="ow-sub-section-title">Panchakarma Staff</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Male Panchakarma Therapist</label>
                      <input type="number" name="male_panchakarma_therapist" value={formData.male_panchakarma_therapist} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Female Panchakarma Therapist</label>
                      <input type="number" name="female_panchakarma_therapist" value={formData.female_panchakarma_therapist} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="ow-field-group">
                    <label>Upload BCP Registration Documents of all Staff</label>
                    <input type="file" name="file_panchakarma_staff_docs" onChange={handleFileChange} />
                  </div>
                </>
              )}

              {formData.services.includes('Yoga') && (
                <>
                  <div className="ow-sub-section-title">Yoga Staff</div>
                  <div className="ow-field-group">
                    <label>Yoga Instructor count (min 1)</label>
                    <input type="number" name="yoga_instructor_count" value={formData.yoga_instructor_count} onChange={handleChange} />
                  </div>
                  <div className="ow-field-group">
                    <label>Upload Qualification Certificate</label>
                    <input type="file" name="file_yoga_cert" onChange={handleFileChange} />
                  </div>
                </>
              )}

              {formData.services.includes('Naturopathy') && (
                <>
                  <div className="ow-sub-section-title">Naturopathy Staff</div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Name of BNYS Doctor</label>
                      <input type="text" name="bnys_doctor_name" value={formData.bnys_doctor_name} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Upload Registration Certificate</label>
                      <input type="file" name="file_bnys_cert" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div className="ow-row">
                    <div className="ow-field-group">
                      <label>Male Yog & Naturopathy Attendant</label>
                      <input type="number" name="male_naturopathy_attendant" value={formData.male_naturopathy_attendant} onChange={handleChange} />
                    </div>
                    <div className="ow-field-group">
                      <label>Female Yog & Naturopathy Attendant</label>
                      <input type="number" name="female_naturopathy_attendant" value={formData.female_naturopathy_attendant} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SECTION 5 */}
          {step === 5 && (
            <div className="ow-section">
              <h3>Section 5: Fee & Declaration</h3>
              
              <div className="ow-field-group ow-fee-section">
                <label>Rs 200 Fee Deposited</label>
                <div className="ow-toggle">
                  <span className={formData.fee_deposited ? 'active' : ''} onClick={() => setFormData({...formData, fee_deposited: true})}>Yes</span>
                  <span className={!formData.fee_deposited ? 'active' : ''} onClick={() => setFormData({...formData, fee_deposited: false})}>No</span>
                </div>
              </div>
              <div className="ow-field-group">
                <label>Upload Fee Submission Receipt</label>
                <input type="file" name="file_fee_receipt" onChange={handleFileChange} />
              </div>

              <div className="ow-declarations">
                <h4>Declarations (All must be checked *)</h4>
                {[
                  "All services available at the centre are being displayed at the reception / centre's website",
                  "Record of each and every visitor of centre is being maintained which can be checked anytime",
                  "Centre is providing only those services, the category under which it is registered",
                  "Centre will get registered under clinical establishment act, if provide clinical services",
                  "Centre doesn't use therapy products like oil and other disposable products of one person for another",
                  "Centre maintains proper hygiene and sanitation in the premise",
                  "Centre disposes Biomedical waste as per Pollution Control Board guidelines",
                  "Cross Massage is strictly prohibited in the centre and a board displaying the same is available at reception",
                  "Name & Number of nearest emergency referral centre is available at reception",
                  "All staff following a dress code with name badge",
                  "Complaint and suggestion box available in the waiting area",
                  "Details of available therapies with duration and rates displayed at reception",
                  "Sterilisation and disinfection facilities are available at centre",
                  "All food products being used must be FSSAI Certified, GMP certified or self-grown",
                  "Centre has a Fire extinguisher installed with AMC",
                  "Centre has separate Male and Female Therapy rooms",
                  "Centre Provides prescribed therapies in soft copy / hard copy to every visitor",
                  "Centre maintains attendance register on daily basis"
                ].map((text, i) => (
                  <label key={i} className="ow-checkbox-label">
                    <input type="checkbox" name={`dec_${i+1}`} checked={formData[`dec_${i+1}`]} onChange={handleChange} />
                    <span>{i+1}. {text} *</span>
                  </label>
                ))}
              </div>

              <div className="ow-field-group">
                <label>Upload Affidavit of above declaration</label>
                <input type="file" name="file_affidavit_final" onChange={handleFileChange} />
              </div>

              <label className="ow-checkbox-label ow-final-dec">
                <input type="checkbox" name="dec_final" checked={formData.dec_final} onChange={handleChange} />
                <span>I hereby declare that all the information provided in the application is true and correct in every respect and if any information is found to be incorrect the application shall be liable to be rejected. *</span>
              </label>

              {showPreview && (
                <div className="ow-preview-box">
                  <h4>Preview of Data</h4>
                  <pre>{JSON.stringify(formData, null, 2)}</pre>
                  <button type="button" className="ow-btn-secondary" onClick={() => setShowPreview(false)}>Close Preview</button>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="ow-modal-footer">
          {step > 1 && <button className="ow-btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 5 && <button className="ow-btn-primary" onClick={() => setStep(step + 1)}>Next</button>}
          {step === 5 && (
            <>
              <button className="ow-btn-secondary" onClick={() => setShowPreview(true)}>Preview</button>
              <button className="ow-btn-success" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </>
          )}
        </div>
        
        {isSubmitting && (
          <div className="ow-upload-progress">
            <div className="ow-progress-text">Uploading... {uploadProgress}%</div>
            <div className="ow-progress-track">
              <div className="ow-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ow-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .ow-modal-content {
          background: #ffffff;
          width: 90%;
          max-width: 900px;
          height: 90vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .ow-modal-header {
          padding: 20px;
          background: #166534;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ow-modal-header h2 { margin: 0; font-size: 1.4rem; font-weight: 600; }
        .ow-close-btn {
          background: transparent; border: none; color: white;
          font-size: 1.8rem; cursor: pointer; transition: 0.2s;
        }
        .ow-close-btn:hover { color: #86efac; }
        .ow-progress-bar-container { height: 6px; background: #e5e7eb; width: 100%; }
        .ow-progress-bar { height: 100%; background: #22c55e; transition: width 0.3s ease; }
        .ow-step-indicator { padding: 10px 20px; font-weight: bold; color: #166534; border-bottom: 1px solid #e5e7eb; }
        .ow-scrollable-area { flex: 1; overflow-y: auto; padding: 20px; }
        .ow-section h3 { color: #166534; margin-bottom: 20px; border-bottom: 2px solid #bbf7d0; padding-bottom: 10px; }
        .ow-sub-section-title { font-weight: bold; color: #15803d; margin: 15px 0 10px; }
        .ow-field-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .ow-row { display: flex; gap: 15px; }
        .ow-row .ow-field-group { flex: 1; }
        .ow-field-group label { margin-bottom: 6px; font-weight: 500; color: #374151; font-size: 0.95rem; }
        .ow-field-group input[type="text"], .ow-field-group input[type="number"], .ow-field-group input[type="date"], .ow-field-group select, .ow-field-group textarea {
          padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s;
        }
        .ow-field-group input:focus, .ow-field-group select:focus, .ow-field-group textarea:focus {
          outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.1);
        }
        .ow-category-display { background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 20px; }
        .ow-cat-card { font-size: 1.2rem; font-weight: bold; color: #166534; padding: 10px; background: white; border-radius: 6px; text-align: center; border: 1px dashed #22c55e; margin: 10px 0; }
        .ow-hint { color: #15803d; font-size: 0.85rem; }
        .ow-chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .ow-chip {
          padding: 8px 16px; border-radius: 20px; border: 1px solid #d1d5db; background: #f9fafb;
          cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
        }
        .ow-chip.active { background: #166534; color: white; border-color: #166534; }
        .ow-chip.disabled { opacity: 0.5; cursor: not-allowed; }
        .ow-modal-footer { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px; background: #f9fafb; }
        .ow-btn-primary { background: #166534; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .ow-btn-primary:hover { background: #14532d; }
        .ow-btn-secondary { background: #e5e7eb; color: #374151; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .ow-btn-secondary:hover { background: #d1d5db; }
        .ow-btn-success { background: #22c55e; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .ow-btn-success:hover { background: #16a34a; }
        .ow-btn-success:disabled { background: #9ca3af; cursor: not-allowed; }
        .ow-checkbox-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
        .ow-checkbox-label { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 0.95rem; color: #4b5563; }
        .ow-checkbox-label input { margin-top: 4px; accent-color: #166534; width: 16px; height: 16px; }
        .ow-fee-section .ow-toggle { display: flex; gap: 0; overflow: hidden; border-radius: 6px; border: 1px solid #166534; width: max-content; }
        .ow-toggle span { padding: 8px 20px; cursor: pointer; font-weight: bold; background: white; color: #166534; transition: 0.2s; }
        .ow-toggle span.active { background: #166534; color: white; }
        .ow-error-msg { background: #fee2e2; color: #b91c1c; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-weight: bold; }
        .ow-upload-progress { padding: 20px; background: #f0fdf4; border-top: 1px solid #bbf7d0; }
        .ow-progress-text { margin-bottom: 5px; font-weight: bold; color: #166534; text-align: center; }
        .ow-progress-track { height: 8px; background: #dcfce7; border-radius: 4px; overflow: hidden; }
        .ow-progress-fill { height: 100%; background: #22c55e; transition: width 0.2s ease; }
        .ow-preview-box { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; }
        .ow-preview-box pre { font-size: 0.85rem; max-height: 300px; overflow-y: auto; }
      `}</style>
    </div>
  );
}
