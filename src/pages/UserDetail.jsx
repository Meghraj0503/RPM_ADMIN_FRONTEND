import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHeaderContext } from "../contexts/HeaderContext";
import {
  getUserDetail,
  getUserAuditTrail,
  assignSubscription,
  suspendSubscription,
  updateUserMedicalProfile,
  updateUserLifestyle,
  changeUserStatus,
  changeProgram,
  getEnrollmentHistory,
  getUserDevices,
  assignDevice,
  removeDevice,
} from "../api/admin";
import { MdSearch, MdClose, MdWarningAmber } from "react-icons/md";

import UserDetailHeader from "../components/userDetail/UserDetailHeader";
import UserDetailTabs from "../components/userDetail/UserDetailTabs";
import PersonalTab from "../components/userDetail/tabs/PersonalTab";
import HealthTab from "../components/userDetail/tabs/HealthTab";
import LifestyleTab from "../components/userDetail/tabs/LifestyleTab";
import EnrollmentTab from "../components/userDetail/tabs/EnrollmentTab";
import DevicesTab from "../components/userDetail/tabs/DevicesTab";
import QuestionnairesTab from "../components/userDetail/tabs/QuestionnairesTab";
import AuditTab from "../components/userDetail/tabs/AuditTab";
import "./style.css";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCustomLeftComponent } = useHeaderContext();

  const [data, setData] = useState(null);
  const [audit, setAudit] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // Enrollment history (shared between EnrollmentTab and fetchData)
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);

  // Program modals
  const [changeProgramModal, setChangeProgramModal] = useState(false);
  const [removeProgramModal, setRemoveProgramModal] = useState(false);
  const [changeProgramData, setChangeProgramData] = useState({
    program_name: "",
    start_date: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Subscription modal
  const [subModal, setSubModal] = useState(false);
  const [subDays, setSubDays] = useState(30);

  // Medical profile modal
  const [medModal, setMedModal] = useState(false);
  const [editType, setEditType] = useState("");
  const [editList, setEditList] = useState([]);
  const [editInput, setEditInput] = useState("");

  // Lifestyle modal
  const [lifeModal, setLifeModal] = useState(false);
  const [lifeData, setLifeData] = useState({
    diet_type: "",
    physical_activity_level: "",
    smoking_status: "",
    alcohol_consumption: "",
  });

  // Device state
  const [deviceList, setDeviceList] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    mac_address: "",
    nickname: "",
  });
  const [deviceSaving, setDeviceSaving] = useState(false);

  /* ── Data fetching ── */
  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getUserDetail(id, { days }),
      getUserAuditTrail(id),
      getEnrollmentHistory(id),
    ])
      .then(([d, a, h]) => {
        setData(d.data);
        setAudit(a.data.history || []);
        setEnrollmentHistory(h.data.history || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchDevices = () => {
    getUserDevices(id)
      .then((r) => setDeviceList(r.data.devices || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, [id, days]);
  useEffect(() => {
    if (activeTab === "devices") fetchDevices();
  }, [activeTab, id]);

  /* ── Inject UserDetailHeader into the global Header's left slot ── */
  useEffect(() => {
    if (!data?.user) return;
    setCustomLeftComponent(
      <UserDetailHeader
        u={data.user}
        onBack={() => navigate("/users")}
        onViewHistory={() => setActiveTab("audit")}
        inHeader
      />
    );
  }, [data, navigate, setActiveTab, setCustomLeftComponent]);

  /* ── Clear the custom header when leaving this page ── */
  useEffect(() => {
    return () => setCustomLeftComponent(null);
  }, [setCustomLeftComponent]);

  /* ── Device handlers ── */
  const handleAssignDevice = async () => {
    if (!deviceForm.mac_address.trim())
      return alert("Device Serial Number is required");
    setDeviceSaving(true);
    try {
      await assignDevice(id, deviceForm);
      setDeviceForm({ mac_address: "", nickname: "" });
      setShowAssignForm(false);
      fetchDevices();
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to assign device");
    } finally {
      setDeviceSaving(false);
    }
  };

  const handleRemoveDevice = async (devId) => {
    if (!window.confirm("Remove this device?")) return;
    await removeDevice(id, devId);
    fetchDevices();
    fetchData();
  };

  /* ── Program / subscription handlers ── */
  const handleAssignSub = async () => {
    try {
      await assignSubscription(id, { validity_days: subDays });
      setSubModal(false);
      fetchData();
    } catch {
      alert("Failed to assign");
    }
  };

  const toggleStatus = async (status) => {
    await changeUserStatus(id, { is_active: status });
    fetchData();
  };

  const handleChangeProgram = async () => {
    if (!changeProgramData.program_name.trim())
      return alert("Please enter a program name");
    try {
      await changeProgram(id, changeProgramData);
      setChangeProgramModal(false);
      setChangeProgramData({
        program_name: "",
        start_date: new Date().toISOString().split("T")[0],
        reason: "",
      });
      fetchData();
    } catch {
      alert("Failed to change program");
    }
  };

  const handleRemoveProgram = async () => {
    try {
      await suspendSubscription(id, { reason: "Removed by admin" });
      setRemoveProgramModal(false);
      fetchData();
    } catch {
      alert("Failed to remove from program");
    }
  };

  /* ── Medical profile handlers ── */
  const handleEditClick = (type) => {
    const u = data.user;
    setEditType(type);
    if (type === "conditions")
      setEditList(
        (u.user_medical_conditions || []).map((c) => c.condition_name),
      );
    else if (type === "medications")
      setEditList((u.user_medications || []).map((m) => m.medication_name));
    else setEditList((u.user_allergies || []).map((a) => a.allergy_name));
    setMedModal(true);
    setEditInput("");
  };

  const handleListAdd = (e) => {
    if (e.key === "Enter" && editInput.trim()) {
      setEditList([...editList, editInput.trim()]);
      setEditInput("");
    }
  };

  const handleListRemove = (index) =>
    setEditList(editList.filter((_, i) => i !== index));

  const saveMedProfile = async () => {
    try {
      let finalEditList = [...editList];
      if (editInput.trim()) finalEditList.push(editInput.trim());
      await updateUserMedicalProfile(id, {
        conditions: editType === "conditions" ? finalEditList : undefined,
        medications: editType === "medications" ? finalEditList : undefined,
        allergies: editType === "allergies" ? finalEditList : undefined,
      });
      setMedModal(false);
      fetchData();
    } catch {
      alert("Failed to update medical profile");
    }
  };

  /* ── Lifestyle handlers ── */
  const openLifeModal = () => {
    const l = data.user?.user_lifestyle || {};
    setLifeData({
      diet_type: l.diet_type || "",
      physical_activity_level: l.physical_activity_level || "",
      smoking_status: l.smoking_status || "",
      alcohol_consumption: l.alcohol_consumption || "",
    });
    setLifeModal(true);
  };

  const saveLifeProfile = async () => {
    try {
      await updateUserLifestyle(id, lifeData);
      setLifeModal(false);
      fetchData();
    } catch {
      alert("Failed to update lifestyle");
    }
  };

  /* ── Early returns ── */
  if (loading && !data)
    return (
      <div className="full-center">
        <div className="spinner" />
      </div>
    );
  if (!data?.user) return <div className="ud-not-found">User not found.</div>;

  const u = data.user;
  const profile = u.user_profile || {};
  const vitals = data.vitals || [];
  const qs = data.questionnaires || [];
  const sub = u.user_subscription;

  const age = profile.date_of_birth
    ? Math.floor((new Date() - new Date(profile.date_of_birth)) / 31557600000)
    : "—";

  const medTagClass =
    editType === "conditions"
      ? "ud-med-tag--condition"
      : editType === "medications"
        ? "ud-med-tag--medication"
        : "ud-med-tag--allergy";

  return (
    <div className="user-detail-page userDtlWrap">
      <div className="ud-save-bar">
        <div className="ud-save-bar__status">
          <span className="ud-save-bar__dot"></span>
          All changes saved
        </div>
        <div>Last saved : Just now</div>
      </div>

      <UserDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="ud-content">
        {activeTab === "personal" && (
          <PersonalTab
            u={u}
            profile={profile}
            age={age}
            toggleStatus={toggleStatus}
          />
        )}
        {activeTab === "health" && (
          <HealthTab
            u={u}
            vitals={vitals}
            days={days}
            setDays={setDays}
            profile={profile}
            handleEditClick={handleEditClick}
          />
        )}
        {activeTab === "lifestyle" && (
          <LifestyleTab u={u} openLifeModal={openLifeModal} />
        )}
        {activeTab === "enrollment" && (
          <EnrollmentTab
            sub={sub}
            qs={qs}
            enrollmentHistory={enrollmentHistory}
            onChangeProgram={() => {
              setChangeProgramData((p) => ({ ...p, program_name: "" }));
              setChangeProgramModal(true);
            }}
            onRemoveProgram={() => setRemoveProgramModal(true)}
          />
        )}
        {activeTab === "devices" && (
          <DevicesTab
            deviceList={deviceList}
            showAssignForm={showAssignForm}
            setShowAssignForm={setShowAssignForm}
            deviceForm={deviceForm}
            setDeviceForm={setDeviceForm}
            deviceSaving={deviceSaving}
            handleAssignDevice={handleAssignDevice}
            handleRemoveDevice={handleRemoveDevice}
          />
        )}
        {activeTab === "questionnaires" && <QuestionnairesTab qs={qs} />}
        {activeTab === "audit" && <AuditTab u={u} audit={audit} />}
      </div>

      {/* ══════════ SUBSCRIPTION MODAL ══════════ */}
      {subModal && (
        <div className="ud-modal-overlay">
          <div className="ud-modal ud-modal--sm">
            <h3 className="ud-modal__title">Assign Subscription</h3>
            <div className="ud-modal__field ud-modal__field--lg">
              <label className="ud-modal__label">Validity Period (days)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={subDays}
                onChange={(e) => setSubDays(e.target.value)}
                className="ud-modal__input ud-modal__input--sm"
              />
            </div>
            <div className="ud-modal__actions">
              <button className="ud-sub-assign-btn" onClick={handleAssignSub}>
                Assign
              </button>
              <button
                className="ud-sub-cancel-btn"
                onClick={() => setSubModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MEDICAL PROFILE MODAL ══════════ */}
      {medModal && (
        <div className="ud-modal-overlay">
          <div className="ud-modal ud-modal--xl">
            <h3 className="ud-modal__title">
              {editType === "conditions"
                ? "Medical Conditions"
                : editType === "medications"
                  ? "Medications"
                  : "Allergies"}
            </h3>
            <div className="ud-med-search-row">
              <div className="ud-med-search-wrap">
                <input
                  type="text"
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onKeyDown={handleListAdd}
                  placeholder={`Type ${editType === "conditions" ? "a condition" : editType === "medications" ? "a medication" : "an allergy"} to add...`}
                  className="ud-med-search-input"
                />
                <MdSearch className="ud-med-search-icon" />
              </div>
              <button
                className="ud-med-add-btn"
                onClick={() => {
                  if (editInput.trim()) {
                    setEditList([...editList, editInput.trim()]);
                    setEditInput("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <div className="ud-med-tag-list">
              {editList.map((item, index) => (
                <span key={index} className={`ud-med-tag ${medTagClass}`}>
                  {item}
                  <MdClose
                    className="ud-med-tag__close"
                    onClick={() => handleListRemove(index)}
                  />
                </span>
              ))}
            </div>
            <div className="ud-modal__actions">
              <button className="ud-modal-save-btn" onClick={saveMedProfile}>
                Save Changes
              </button>
              <button
                className="ud-modal-close-btn"
                onClick={() => setMedModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ LIFESTYLE MODAL ══════════ */}
      {lifeModal && (
        <div className="ud-modal-overlay">
          <div className="ud-modal ud-modal--md">
            <h3 className="ud-modal__title">Edit Lifestyle Details</h3>
            {[
              {
                label: "Diet Type",
                field: "diet_type",
                placeholder: "e.g. Vegetarian",
              },
              {
                label: "Physical Activity Level",
                field: "physical_activity_level",
                placeholder: "e.g. Moderate",
              },
              {
                label: "Smoking",
                field: "smoking_status",
                placeholder: "e.g. No, Occasional",
              },
            ].map((f) => (
              <div key={f.field} className="ud-modal__field">
                <label className="ud-modal__label">{f.label}</label>
                <input
                  type="text"
                  value={lifeData[f.field]}
                  onChange={(e) =>
                    setLifeData({ ...lifeData, [f.field]: e.target.value })
                  }
                  placeholder={f.placeholder}
                  className="ud-modal__input ud-modal__input--sm"
                />
              </div>
            ))}
            <div className="ud-modal__field ud-modal__field--lg">
              <label className="ud-modal__label">Alcohol</label>
              <input
                type="text"
                value={lifeData.alcohol_consumption}
                onChange={(e) =>
                  setLifeData({
                    ...lifeData,
                    alcohol_consumption: e.target.value,
                  })
                }
                placeholder="e.g. Occasional"
                className="ud-modal__input ud-modal__input--sm"
              />
            </div>
            <div className="ud-modal__actions">
              <button
                className="ud-modal-confirm-btn"
                onClick={saveLifeProfile}
              >
                Save Changes
              </button>
              <button
                className="ud-modal-cancel-btn"
                onClick={() => setLifeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ CHANGE PROGRAM MODAL ══════════ */}
      {changeProgramModal && (
        <div className="ud-modal-overlay">
          <div className="ud-modal ud-modal--lg">
            <h3 className="ud-modal__title">Change Program Enrollment</h3>
            {sub?.program_name && sub?.status === "Active" && (
              <div className="ud-program-current-box">
                <span className="ud-program-current-text">
                  Current : <strong>{sub.program_name}</strong>
                </span>
              </div>
            )}
            <div className="ud-modal__field">
              <label className="ud-modal__label">
                New Program <span className="ud-modal__req">*</span>
              </label>
              <input
                type="text"
                value={changeProgramData.program_name}
                onChange={(e) =>
                  setChangeProgramData((p) => ({
                    ...p,
                    program_name: e.target.value,
                  }))
                }
                placeholder="Select New Program"
                className="ud-modal__input"
              />
            </div>
            <div className="ud-modal__field">
              <label className="ud-modal__label">New Enrollment Date</label>
              <input
                type="date"
                value={changeProgramData.start_date}
                onChange={(e) =>
                  setChangeProgramData((p) => ({
                    ...p,
                    start_date: e.target.value,
                  }))
                }
                className="ud-modal__input"
              />
            </div>
            <div className="ud-modal__field ud-modal__field--xl">
              <label className="ud-modal__label">
                Reason for Change (Optional)
              </label>
              <textarea
                value={changeProgramData.reason}
                onChange={(e) =>
                  setChangeProgramData((p) => ({
                    ...p,
                    reason: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Enter reason..."
                className="ud-modal__textarea"
              />
            </div>
            <div className="ud-modal__actions">
              <button
                className="ud-modal-cancel-btn"
                onClick={() => setChangeProgramModal(false)}
              >
                Cancel
              </button>
              <button
                className="ud-modal-confirm-btn"
                onClick={handleChangeProgram}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ REMOVE FROM PROGRAM MODAL ══════════ */}
      {removeProgramModal && (
        <div className="ud-modal-overlay">
          <div className="ud-modal ud-modal--md ud-modal--centered">
            <div className="ud-remove-warning">
              <MdWarningAmber size={20} color="#FF5C5C" />
              <span className="ud-remove-warning__text">
                Remove from Program?
              </span>
            </div>
            <p className="ud-remove-desc">
              Removing <strong>{u?.name || "this user"}</strong> from{" "}
              <strong>{sub?.program_name || "the program"}</strong> will stop
              active tracking and monitoring. Historical data will be preserved.
            </p>
            <p className="ud-remove-note">
              This action can be reversed by re-enrolling the user.
            </p>
            <div className="ud-modal__actions ud-modal__actions--col">
              <button className="ud-remove-btn" onClick={handleRemoveProgram}>
                Remove From Program
              </button>
              <button
                className="ud-keep-btn"
                onClick={() => setRemoveProgramModal(false)}
              >
                Keep In Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
