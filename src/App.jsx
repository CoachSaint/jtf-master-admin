import { useState, useEffect } from "react";
import "./styles.css";
import Header from "./components/Header";
import LockScreen from "./components/LockScreen";
import StepLead from "./components/StepLead";
import StepMeasure from "./components/StepMeasure";
import StepQuote from "./components/StepQuote";
import StepSend from "./components/StepSend";
import StepSign from "./components/StepSign";
import DealsPipeline from "./components/DealsPipeline";
import { dealStorage } from "./lib/storage";
import { authService, AUTHORIZED_OPERATORS } from "./lib/auth";

const STEPS = [
  { id: 1, label: "Lead", sub: "Step 1" },
  { id: 2, label: "Measure", sub: "Step 2" },
  { id: 3, label: "Quote", sub: "Step 3" },
  { id: 4, label: "Send", sub: "Step 4" },
  { id: 5, label: "Sign", sub: "Step 5" },
];

export default function App() {
  const [authed, setAuthed] = useState(() => authService.isAuthenticated());
  const [operator, setOperator] = useState(() => authService.getCurrentUser());
  const [tab, setTab] = useState("flow"); // "flow" | "deals"
  const [currentStep, setCurrentStep] = useState(1);
  const [deals, setDeals] = useState(dealStorage.getDeals());
  const [activeDeal, setActiveDeal] = useState(() => {
    const existing = dealStorage.getDeals();
    return existing.length > 0 ? existing[0] : createEmptyDeal();
  });

  function createEmptyDeal() {
    return {
      id: "deal_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "draft",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      address: "",
      dealType: "retail",
      measurements: null,
      selectedPackage: null,
      customQuote: null,
      lineItems: [],
      discountPct: 0,
      grandTotal: 0,
      proposal: null,
      signatures: null,
    };
  }

  function handleUnlock(user) {
    setOperator(user);
    setAuthed(true);
  }

  function handleOperatorChange(op) {
    setOperator(op);
    authService.switchOperator(op.id);
  }

  function handleUpdateDeal(patch) {
    const updated = { ...activeDeal, ...patch };
    setActiveDeal(updated);
    const saved = dealStorage.saveDeal(updated);
    setDeals(dealStorage.getDeals());
    return saved;
  }

  function handleNewDeal() {
    const empty = createEmptyDeal();
    setActiveDeal(empty);
    dealStorage.saveDeal(empty);
    setDeals(dealStorage.getDeals());
    setCurrentStep(1);
    setTab("flow");
  }

  function handleSelectDeal(deal) {
    setActiveDeal(deal);
    setCurrentStep(deal.status === "signed" ? 5 : deal.grandTotal ? 4 : deal.measurements ? 3 : 1);
    setTab("flow");
  }

  function handleDeleteDeal(id) {
    const updated = dealStorage.deleteDeal(id);
    setDeals(updated);
    if (activeDeal.id === id) {
      if (updated.length > 0) {
        setActiveDeal(updated[0]);
      } else {
        handleNewDeal();
      }
    }
  }

  if (!authed) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        activeOperator={operator}
        onOperatorChange={handleOperatorChange}
        currentTab={tab}
        onTabChange={setTab}
        activeDeal={activeDeal}
      />

      {tab === "deals" ? (
        <DealsPipeline
          deals={deals}
          onSelectDeal={handleSelectDeal}
          onNewDeal={handleNewDeal}
          onDeleteDeal={handleDeleteDeal}
        />
      ) : (
        <>
          {/* Step Pipeline Ribbon */}
          <div className="step-ribbon">
            {STEPS.map((s) => {
              const isCur = currentStep === s.id;
              const isPast = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`step-tab ${isCur ? "active" : ""} ${isPast ? "completed" : ""}`}
                  onClick={() => setCurrentStep(s.id)}
                >
                  <span className="step-num">{s.sub}</span>
                  <span className="step-label">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Content */}
          {currentStep === 1 && (
            <StepLead
              deal={activeDeal}
              onUpdateDeal={handleUpdateDeal}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepMeasure
              deal={activeDeal}
              operator={operator}
              onUpdateDeal={handleUpdateDeal}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <StepQuote
              deal={activeDeal}
              onUpdateDeal={handleUpdateDeal}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <StepSend
              deal={activeDeal}
              operator={operator}
              onUpdateDeal={handleUpdateDeal}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <StepSign
              deal={activeDeal}
              operator={operator}
              onUpdateDeal={handleUpdateDeal}
              onBack={() => setCurrentStep(4)}
              onComplete={handleNewDeal}
            />
          )}
        </>
      )}
    </div>
  );
}
