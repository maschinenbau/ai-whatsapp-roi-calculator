import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Simple Card Components (Remain in English for code clarity) ---
const Card = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg border border-gray-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h2 className={`text-xl font-bold text-gray-800 ${className}`}>{children}</h2>
);
const CardContent = ({ children, className }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// --- Print Styles Component (CSS remains unchanged) ---
const PrintStyles = () => (
  <style type="text/css">
    {`
      @media print {
        body * { visibility: hidden; }
        #printable-area, #printable-area * { visibility: visible; }
        #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print, .no-print * { display: none !important; }
        .print-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .print-p-0 { padding: 0 !important; }
        .print-shadow-none { box-shadow: none !important; }
        .print-border-none { border: none !important; }
        .recharts-legend-wrapper { position: relative !important; }
        .recharts-tooltip-wrapper { display: none !important; }
        .bg-white { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-50 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-100 { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { color: inherit !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .text-white { color: white !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-red-500 { color: #ef4444 !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-red-700 { color: #b91c1c !important; }
        .text-green-600 { color: #16a34a !important; }
        .text-green-700 { color: #15803d !important; }
        .text-green-800 { color: #166534 !important; }
      }
    `}
  </style>
);

// --- Helper Function to Safely Format Numbers (Using es-MX locale) - CORRECTED ---
const safeLocaleString = (value, options = {}, fallback = '0.00') => {
    const locale = 'es-MX'; // Mexican Spanish locale
    if (typeof value === 'number' && isFinite(value)) {
        // Start with default options based on style
        let defaultOptions = {};
        if (options.style === 'percent') {
            // Default 0 decimals for percent, unless overridden
            defaultOptions = { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 };
        } else if (options.style === 'currency') {
            defaultOptions = { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 };
        } else {
            // Default for 'decimal' or unspecified style
            defaultOptions = {
                style: 'decimal',
                // Default 0 decimals for integers, 2 otherwise
                minimumFractionDigits: (Number.isInteger(value) && value !== 0) ? 0 : 2,
                maximumFractionDigits: 2
            };
        }

        // Merge passed options, overriding defaults.
        let finalOptions = { ...defaultOptions, ...options };

        // Ensure minimumFractionDigits and maximumFractionDigits are valid numbers >= 0
        finalOptions.minimumFractionDigits = Math.max(0, Number(finalOptions.minimumFractionDigits) || 0);
        finalOptions.maximumFractionDigits = Math.max(0, Number(finalOptions.maximumFractionDigits) || 0);

        // Ensure maximumFractionDigits is not less than minimumFractionDigits
        if (finalOptions.maximumFractionDigits < finalOptions.minimumFractionDigits) {
             finalOptions.minimumFractionDigits = finalOptions.maximumFractionDigits;
        }

        try {
             return value.toLocaleString(locale, finalOptions);
        } catch (e) {
             console.error("Error formatting number:", value, "with options:", finalOptions, e);
             try {
                return value.toLocaleString(locale); // Basic fallback
             } catch (basicError) {
                console.error("Basic formatting failed too:", value, basicError);
                return fallback; // Absolute fallback
             }
        }
    }
    // Fallback logic for non-numbers or invalid inputs
    if ((options.style === 'percent' && fallback === 'N/A') || fallback === 'N/A') {
        return 'N/A';
    }
    const fallbackNum = Number(fallback);
    if (!isNaN(fallbackNum) && isFinite(fallbackNum)) {
        return fallbackNum.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'decimal' });
    }
    return fallback; // Return string fallback as is
};


// --- Main Calculator Component (WhatsApp Focus) ---
function App() {
  // --- State Variables (Adapted for WhatsApp) ---

  // --- UPDATED WhatsApp AI Platform Pricing Tiers (MXN) ---
  const pricingTiers = {
    basic: {
        name: "Básico", setupFee: 15000, monthlyFee: 8000,
        description: "Funcionalidad esencial"
    },
    professional: {
        name: "Profesional", setupFee: 42500, monthlyFee: 21500,
        description: "Funciones avanzadas y soporte"
    },
    enterprise: {
        name: "Empresarial", setupFee: 120000, monthlyFee: 42500,
        description: "Soluciones personalizadas (A partir de)"
    }
  };

  // --- Industry Presets: 10 Specialties + Fallback with Benchmarks Rounded Down ---
  const industryPresets = {
    medicina_familiar: { // Moved to top
        businessHourMessages: 37, afterHourMessages: 10, missedMessageRate: 10,
        valuePerChatConversion: 650, conversionRateLift: 40,
        salesMessagePercentage: 25, baseConversionRate: 70,
        humanHourlyWage: 80, humanOverheadPercentage: 20, automationCoverage: 70
    },
    clinica_dental: {
        businessHourMessages: 40, afterHourMessages: 15, missedMessageRate: 10,
        valuePerChatConversion: 2500, conversionRateLift: 42,
        salesMessagePercentage: 65, baseConversionRate: 22,
        humanHourlyWage: 97, humanOverheadPercentage: 30, automationCoverage: 70
    },
    quiropráctico: {
        businessHourMessages: 30, afterHourMessages: 10, missedMessageRate: 6,
        valuePerChatConversion: 1850, conversionRateLift: 52,
        salesMessagePercentage: 45, baseConversionRate: 37,
        humanHourlyWage: 102, humanOverheadPercentage: 27, automationCoverage: 70
    },
    terapia_fisica: {
        businessHourMessages: 57, afterHourMessages: 17, missedMessageRate: 12,
        valuePerChatConversion: 1350, conversionRateLift: 37,
        salesMessagePercentage: 55, baseConversionRate: 47,
        humanHourlyWage: 90, humanOverheadPercentage: 24, automationCoverage: 70
    },
    optometrista: {
        businessHourMessages: 17, afterHourMessages: 4, missedMessageRate: 10,
        valuePerChatConversion: 2250, conversionRateLift: 40,
        salesMessagePercentage: 35, baseConversionRate: 27,
        humanHourlyWage: 85, humanOverheadPercentage: 22, automationCoverage: 70
    },
     urgencias: {
        businessHourMessages: 100, afterHourMessages: 37, missedMessageRate: 4,
        valuePerChatConversion: 4750, conversionRateLift: 62,
        salesMessagePercentage: 85, baseConversionRate: 75,
        humanHourlyWage: 115, humanOverheadPercentage: 32, automationCoverage: 70
    },
    salud_mental: {
        businessHourMessages: 47, afterHourMessages: 30, missedMessageRate: 15,
        valuePerChatConversion: 2250, conversionRateLift: 32,
        salesMessagePercentage: 40, baseConversionRate: 30,
        humanHourlyWage: 107, humanOverheadPercentage: 27, automationCoverage: 70
    },
    dermatologia: {
        businessHourMessages: 25, afterHourMessages: 5, missedMessageRate: 10,
        valuePerChatConversion: 2500, conversionRateLift: 40,
        salesMessagePercentage: 55, baseConversionRate: 35,
        humanHourlyWage: 125, humanOverheadPercentage: 30, automationCoverage: 70
    },
    spa_medico: {
        businessHourMessages: 15, afterHourMessages: 6, missedMessageRate: 10,
        valuePerChatConversion: 4500, conversionRateLift: 40,
        salesMessagePercentage: 45, baseConversionRate: 17,
        humanHourlyWage: 140, humanOverheadPercentage: 32, automationCoverage: 70
    },
    podologia: {
        businessHourMessages: 12, afterHourMessages: 3, missedMessageRate: 10,
        valuePerChatConversion: 1175, conversionRateLift: 40,
        salesMessagePercentage: 40, baseConversionRate: 35,
        humanHourlyWage: 97, humanOverheadPercentage: 24, automationCoverage: 70
    },
    otro_salud: { // UPDATED with specific values
        businessHourMessages: 20, afterHourMessages: 5, missedMessageRate: 10,
        valuePerChatConversion: 1000, conversionRateLift: 0,
        salesMessagePercentage: 40, baseConversionRate: 25,
        humanHourlyWage: 97, humanOverheadPercentage: 30, automationCoverage: 70
    }
  };

  // --- Spanish names for the dropdown - Including 'Otro' ---
  const industryNamesEs = {
    medicina_familiar: "Medicina Familiar", // Moved to top
    clinica_dental: "Clínica Dental",
    quiropráctico: "Quiropráctico",
    terapia_fisica: "Terapia Física",
    optometrista: "Optometrista",
    urgencias: "Urgencias",
    salud_mental: "Salud Mental",
    dermatologia: "Dermatología",
    spa_medico: "Spa Médico",
    podologia: "Podología",
    otro_salud: "Otro Sector Salud" // Added back
  };

  // --- Default Industry Selection Updated ---
  const defaultIndustry = "medicina_familiar"; // Set default
  const defaultPreset = industryPresets[defaultIndustry];

  // --- State Initialization using NEW Defaults (Medicina Familiar) ---
  const [businessHourMessages, setBusinessHourMessages] = useState(defaultPreset.businessHourMessages);
  const [afterHourMessages, setAfterHourMessages] = useState(defaultPreset.afterHourMessages);
  const [missedMessageRate, setMissedMessageRate] = useState(defaultPreset.missedMessageRate);
  const [automationPercentage, setAutomationPercentage] = useState(defaultPreset.automationCoverage);
  const [salesMessagePercentage, setSalesMessagePercentage] = useState(defaultPreset.salesMessagePercentage);
  const [daysOpen, setDaysOpen] = useState("sixdays");
  const [avgLeadValue, setAvgLeadValue] = useState(defaultPreset.valuePerChatConversion);
  const calculateConversionRate = (preset) => {
      const rate = preset.baseConversionRate * (1 + preset.conversionRateLift / 100);
      return Math.round(Math.min(rate, 100));
  };
  const initialConversionRate = calculateConversionRate(defaultPreset);
  const [conversionRate, setConversionRate] = useState(initialConversionRate);
  const [industry, setIndustry] = useState(defaultIndustry);
  const [humanHourlyWage, setHumanHourlyWage] = useState(defaultPreset.humanHourlyWage);
  const [humanHoursPerWeek, setHumanHoursPerWeek] = useState(40);
  const [humanOverheadPercentage, setHumanOverheadPercentage] = useState(defaultPreset.humanOverheadPercentage);

  // Input validation state
  const [inputErrors, setInputErrors] = useState({
    businessHourMessages: false, afterHourMessages: false, missedMessageRate: false,
    salesMessagePercentage: false, avgLeadValue: false,
    conversionRate: false, humanHourlyWage: false, humanHoursPerWeek: false,
    humanOverheadPercentage: false,
  });
  const [validationError, setValidationError] = useState(false);

  // AI Platform pricing state
  const [selectedTier, setSelectedTier] = useState("professional");
  const [aiSetupFee, setAiSetupFee] = useState(pricingTiers.professional.setupFee);
  const [aiMonthlyFee, setAiMonthlyFee] = useState(pricingTiers.professional.monthlyFee);

  // Results state
  const [results, setResults] = useState({
    totalMessages: 0, missedMessages: 0, salesMissedMessages: 0, convertedPatientsLost: 0,
    aiPlatformFee: 0, aiSetupFee: 0, aiSetupFeeMonthly: 0,
    aiTotalMonthlyCost: 0, aiTotalCostWithSetup: 0, humanCost: 0,
    potentialRevenue: 0, costSavings: 0, netBenefit: 0, roi: 0,
    paybackPeriod: 0, yearlyCostSavings: 0, yearlyPotentialRevenue: 0,
    yearlyNetBenefit: 0, firstYearNetReturn: 0,
    firstYearRevenueVsAiCost: 0,
    automationPercentage: defaultPreset.automationCoverage
  });

  // --- Effects ---
  useEffect(() => {
    const errorsToCheck = { ...inputErrors };
    delete errorsToCheck.automationPercentage;
    const hasErrors = Object.values(errorsToCheck).some(error => error);
    setValidationError(hasErrors);
  }, [inputErrors]);

  useEffect(() => {
    // Update AI costs when selected tier changes
    if (pricingTiers[selectedTier]) {
      setAiSetupFee(pricingTiers[selectedTier].setupFee);
      setAiMonthlyFee(pricingTiers[selectedTier].monthlyFee);
    }
  }, [selectedTier]);

  // --- Calculation Logic (Updated totalMessages calculation) ---
  useEffect(() => {
    try {
      // Ensure inputs are valid numbers
      const numBusinessMessages = Number(businessHourMessages) || 0;
      const numAfterHoursMessages = Number(afterHourMessages) || 0;
      const numMissedRate = Number(missedMessageRate) || 0;
      const numAutomation = Number(automationPercentage) || 0;
      const numSalesPercent = Number(salesMessagePercentage) || 0;
      const numAvgValuePerConversion = Number(avgLeadValue) || 0;
      const numConversionRate = Number(conversionRate) || 0;
      const numWage = Number(humanHourlyWage) || 0;
      const numHours = Number(humanHoursPerWeek) || 0;
      const numOverhead = Number(humanOverheadPercentage) || 0;

      // Calculate monthly human cost
      const weeklyWageCost = numWage * numHours;
      const yearlyWageCost = weeklyWageCost * 52;
      const monthlyWageCost = yearlyWageCost / 12;
      const calculatedHumanMonthlyCost = monthlyWageCost * (1 + numOverhead / 100);

      // --- Calculate Total Messages Handled by AI (Using LATEST User's Formula Structure) ---
      const daysPerMonth = daysOpen === "weekdays" ? 22 : daysOpen === "sixdays" ? 26 : 30;
      const totalMonthlyBusinessMessages = numBusinessMessages * daysPerMonth;
      const totalMonthlyAfterHourMessages = numAfterHoursMessages * 30;
      const totalReceivedMonthlyMessages = totalMonthlyBusinessMessages + totalMonthlyAfterHourMessages;
      // Component related to missed rate (applied to total received for this formula)
      const monthlyMissedComponent = totalReceivedMonthlyMessages * (numMissedRate / 100);
      // Final calculation for total messages handled by AI per user formula structure: [Received + MissedComponent] * 1.3
      // Factor 1.3 represents estimated increase due to conversation length/exchanges.
      const totalMonthlyMessages = (totalReceivedMonthlyMessages + monthlyMissedComponent) * 1.3;
      // --- End of New Total Messages Calculation ---


      // --- Calculate Missed Opportunities (Original Logic for Revenue/Lost Patients) ---
      // Uses original missed logic: Rate on BH + All AH
      const monthlyMissedBusinessHourMessages_orig = totalMonthlyBusinessMessages * (numMissedRate / 100);
      const totalMissedMessages_orig = monthlyMissedBusinessHourMessages_orig + totalMonthlyAfterHourMessages;
      const salesMissedMessages = totalMissedMessages_orig * (numSalesPercent / 100);
      // --- End of Missed Opportunities Calculation ---

      // Calculate potential revenue from missed messages (using Value per Conversion)
      const potentialRevenueFromMissedMessages = salesMissedMessages * numAvgValuePerConversion;

      // Calculate estimated number of actual patients lost using conversion rate
      const convertedPatientsLost = salesMissedMessages * (numConversionRate / 100);

      // Calculate WhatsApp AI costs (Simplified)
      const aiPlatformFee = aiMonthlyFee;
      const aiTotalMonthlyCost = aiPlatformFee;
      const aiSetupFeeMonthly = aiSetupFee / 12;
      const aiTotalCostWithSetup = aiTotalMonthlyCost + aiSetupFeeMonthly;

      // Calculate financial impact
      const costSavings = calculatedHumanMonthlyCost - aiTotalCostWithSetup;
      const totalBenefit = costSavings + potentialRevenueFromMissedMessages;

      // Calculate ROI (Monthly)
      const roi = aiTotalCostWithSetup > 0 ? (totalBenefit / aiTotalCostWithSetup) * 100 : (totalBenefit > 0 ? Infinity : 0);

      // Calculate payback period in months
      const paybackPeriodMonths = totalBenefit > 0 ? (aiSetupFee / totalBenefit) : Infinity;

      // Calculate annual projections
      const yearlyCostSavings = (calculatedHumanMonthlyCost - aiTotalMonthlyCost) * 12;
      const yearlyPotentialRevenue = potentialRevenueFromMissedMessages * 12;
      const yearlyNetBenefit = yearlyCostSavings + yearlyPotentialRevenue;

      // Calculate first year return
      const firstYearNetReturn = yearlyNetBenefit - aiSetupFee;

      // Calculate comparison of first year revenue vs total AI cost
      const totalInvestmentFirstYear = (aiTotalMonthlyCost * 12) + aiSetupFee;
      const calculatedFirstYearRevenueVsAiCost = yearlyPotentialRevenue - totalInvestmentFirstYear;

      // Update the results state
      setResults({
        totalMessages: totalMonthlyMessages, // Uses the NEW calculation
        missedMessages: totalMissedMessages_orig, // Uses original logic for this display metric
        salesMissedMessages: salesMissedMessages,
        convertedPatientsLost: convertedPatientsLost,
        aiPlatformFee: aiPlatformFee,
        aiSetupFee: aiSetupFee,
        aiSetupFeeMonthly: aiSetupFeeMonthly,
        aiTotalMonthlyCost: aiTotalMonthlyCost,
        aiTotalCostWithSetup: aiTotalCostWithSetup,
        humanCost: calculatedHumanMonthlyCost,
        potentialRevenue: potentialRevenueFromMissedMessages,
        costSavings: costSavings,
        netBenefit: totalBenefit,
        roi: roi,
        paybackPeriod: paybackPeriodMonths,
        yearlyCostSavings: yearlyCostSavings,
        yearlyPotentialRevenue: yearlyPotentialRevenue,
        yearlyNetBenefit: yearlyNetBenefit,
        firstYearNetReturn: firstYearNetReturn,
        firstYearRevenueVsAiCost: calculatedFirstYearRevenueVsAiCost,
        automationPercentage: numAutomation
      });
    } catch (error) {
        console.error("Error during calculation:", error);
    }
  }, [
    // Dependency array updated
    businessHourMessages, afterHourMessages, missedMessageRate, automationPercentage,
    salesMessagePercentage, daysOpen, avgLeadValue, conversionRate,
    aiSetupFee, aiMonthlyFee,
    humanHourlyWage, humanHoursPerWeek, humanOverheadPercentage
  ]);

  // --- Handlers & Helpers ---
  const handleIndustryChange = (e) => {
    const selectedIndustry = e.target.value;
    setIndustry(selectedIndustry);
    const preset = industryPresets[selectedIndustry] || industryPresets.medicina_familiar;

    setBusinessHourMessages(preset.businessHourMessages);
    setAfterHourMessages(preset.afterHourMessages);
    setMissedMessageRate(preset.missedMessageRate);
    setAutomationPercentage(preset.automationCoverage);
    setSalesMessagePercentage(preset.salesMessagePercentage);
    setAvgLeadValue(preset.valuePerChatConversion);
    const newConversionRate = calculateConversionRate(preset);
    setConversionRate(newConversionRate);
    setHumanHourlyWage(preset.humanHourlyWage);
    setHumanOverheadPercentage(preset.humanOverheadPercentage);

    // Clear validation errors
    setInputErrors({
        businessHourMessages: false, afterHourMessages: false, missedMessageRate: false,
        automationPercentage: false, salesMessagePercentage: false, avgLeadValue: false,
        conversionRate: false, humanHourlyWage: false, humanHoursPerWeek: false,
        humanOverheadPercentage: false,
     });
  };

  const handleNumberInputChange = (setter, errorKey, value, min = 0, max = Infinity) => {
    const rawValue = value.trim();
    if (rawValue === '') {
       setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: false }));
       setter('');
       return;
    }
    const numValue = Number(rawValue.replace(',', '.'));
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: true }));
      setter(rawValue);
    } else {
      setInputErrors(prevErrors => ({ ...prevErrors, [errorKey]: false }));
      setter(numValue);
    }
  };

  const formatPaybackPeriod = (periodInMonths) => {
      if (!isFinite(periodInMonths) || periodInMonths < 0) { return "Nunca"; }
      if (periodInMonths === 0) { return "Inmediato"; }
      const years = Math.floor(periodInMonths / 12);
      const months = Math.round(periodInMonths % 12);
      let result = "";
      if (years > 0) { result += `${years} año${years > 1 ? 's' : ''}`; }
      if (months > 0) { result += (result ? " " : "") + `${months} mes${months > 1 ? 'es' : ''}`; }
      return result || "Menos de 1 mes";
  };

  const handlePrint = () => { window.print(); };

  // --- JSX Rendering ---
  return (
    <>
      <PrintStyles />
      <div id="printable-area" className="p-4 max-w-6xl mx-auto font-sans print-p-0 bg-gray-50">
        <Card className="w-full print-shadow-none print-border-none bg-white">
          <CardHeader className="bg-gray-800 text-white rounded-t-lg border-b-0">
            <CardTitle className="text-center text-2xl text-white">Calculadora de ROI de WhatsApp IA (México)</CardTitle>
             <p className="text-center text-sm text-gray-300 mt-1">Compare Costos y Beneficios (WhatsApp IA vs. Status Quo)</p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-grid-cols-1">

              {/* Columna Izquierda: Entradas */}
              <div className="space-y-8">
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Perfil de la Práctica y Volumen de Mensajes WhatsApp</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="industry" className="block text-sm font-medium mb-1 text-gray-600">Especialidad / Tipo de Práctica</label>
                        <select
                          id="industry"
                          value={industry}
                          onChange={handleIndustryChange}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                        >
                          {/* Dropdown now includes 'Otro' */}
                          {Object.keys(industryNamesEs).map(key => (
                            <option key={key} value={key}>
                              {industryNamesEs[key] || key}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Seleccione especialidad para cargar promedios MX.</p>
                      </div>
                      <div>
                        <label htmlFor="daysOpen" className="block text-sm font-medium mb-1 text-gray-600">Días de Operación de la Práctica</label>
                        <select id="daysOpen" value={daysOpen} onChange={(e) => setDaysOpen(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500 transition duration-150">
                          <option value="weekdays">Lunes a Viernes (5 días/semana)</option>
                          <option value="sixdays">Lunes a Sábado (6 días/semana)</option>
                          <option value="alldays">Todos los Días (7 días/semana)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="businessHourMessages" className="block text-sm font-medium mb-1 text-gray-600">Prom. Mensajes Diarios (Horario Comercial)</label>
                        <input
                           id="businessHourMessages" type="number" min="0" step="1" value={businessHourMessages}
                           onChange={(e) => handleNumberInputChange(setBusinessHourMessages, 'businessHourMessages', e.target.value)}
                           className={`w-full p-2 border rounded transition duration-150 ${
                            inputErrors.businessHourMessages ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
                           }`} placeholder="ej., 37" />
                        {inputErrors.businessHourMessages && (<p className="text-red-500 text-xs mt-1">Ingrese un número positivo.</p>)}
                      </div>
                      <div>
                        <label htmlFor="afterHourMessages" className="block text-sm font-medium mb-1 text-gray-600">Prom. Mensajes Diarios (Fuera de Horario)</label>
                        <input id="afterHourMessages" type="number" min="0" step="1" value={afterHourMessages}
                          onChange={(e) => handleNumberInputChange(setAfterHourMessages, 'afterHourMessages', e.target.value)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.afterHourMessages ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="ej., 10" />
                        {inputErrors.afterHourMessages && (<p className="text-red-500 text-xs mt-1">Ingrese un número positivo.</p>)}
                      </div>
                      <div>
                        <label htmlFor="missedMessageRate" className="block text-sm font-medium mb-1 text-gray-600">Tasa de Mensajes Perdidos (%)</label>
                        <input id="missedMessageRate" type="number" min="0" max="100" step="1" value={missedMessageRate}
                          onChange={(e) => handleNumberInputChange(setMissedMessageRate, 'missedMessageRate', e.target.value, 0, 100)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.missedMessageRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="ej., 10" />
                         <p className="text-xs text-gray-500 mt-1">Porcentaje de mensajes en horario comercial no respondidos a tiempo.</p>
                        {inputErrors.missedMessageRate && (<p className="text-red-500 text-xs mt-1">Ingrese un valor entre 0 y 100.</p>)}
                      </div>
                       {/* Automation Percentage Input REMOVED */}
                    </CardContent>
                  </Card>

                 {/* Tarjeta Selección Nivel Plataforma WhatsApp IA */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Seleccione Nivel de Plataforma WhatsApp IA (MXN)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(pricingTiers).map(([key, tier]) => (
                          <div
                            key={key}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 ${
                              selectedTier === key
                                ? 'border-gray-500 bg-gray-100 shadow-md ring-1 ring-gray-500'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            } ${key === 'professional' ? 'relative' : ''}`}
                            onClick={() => setSelectedTier(key)}
                          >
                            {key === 'professional' && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 no-print">
                                <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">RECOMENDADO</span>
                              </div>
                            )}
                            <div className={`text-center mb-2 ${key === 'professional' ? 'mt-3' : ''}`}>
                              <div className="text-md font-bold text-gray-700">{tier.name}</div>
                              <div className="text-xs text-gray-500">{tier.description}</div>
                            </div>
                            <div className="space-y-1.5 mt-3 text-sm text-gray-700">
                              <div className="flex justify-between"><span>Config. API:</span><span className="font-medium text-gray-900">${safeLocaleString(tier.setupFee, { style: 'decimal', minimumFractionDigits: 0 })}</span></div>
                              <div className="flex justify-between"><span>Cuota Mensual:</span><span className="font-medium text-gray-900">${safeLocaleString(tier.monthlyFee, { style: 'decimal', minimumFractionDigits: 0 })}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">Haga clic en un nivel para actualizar los costos de la plataforma IA.</p>
                    </CardContent>
                  </Card>

                 {/* Tarjeta Ingresos y Costos Personal */}
                 <Card className="border border-gray-200 print-shadow-none print-border-none">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold mb-3 text-gray-700">Ingresos y Costos Actuales de Personal (MXN)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label htmlFor="salesMessagePercentage" className="block text-sm font-medium mb-1 text-gray-600">% Mensajes de Nuevos Pacientes/Citas</label>
                        <input id="salesMessagePercentage" type="number" min="0" max="100" step="1" value={salesMessagePercentage}
                          onChange={(e) => handleNumberInputChange(setSalesMessagePercentage, 'salesMessagePercentage', e.target.value, 0, 100)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.salesMessagePercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                          placeholder="ej., 25" />
                         <p className="text-xs text-gray-500 mt-1">¿Qué porcentaje de mensajes son de posibles nuevos pacientes o citas?</p>
                        {inputErrors.salesMessagePercentage && (<p className="text-red-500 text-xs mt-1">Ingrese un valor entre 0 y 100.</p>)}
                      </div>
                      <div>
                        <label htmlFor="avgLeadValue" className="block text-sm font-medium mb-1 text-gray-600">Valor Promedio por **Conversión** de Chat ($ MXN)</label>
                        <input id="avgLeadValue" type="number" min="0" step="1" value={avgLeadValue}
                          onChange={(e) => handleNumberInputChange(setAvgLeadValue, 'avgLeadValue', e.target.value)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.avgLeadValue ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                          placeholder="ej., 650" />
                        <p className="text-xs text-gray-500 mt-1">Valor estimado generado por un paciente que **se convirtió** vía chat.</p>
                        {inputErrors.avgLeadValue && (<p className="text-red-500 text-xs mt-1">Ingrese un número positivo.</p>)}
                      </div>
                      <div>
                        <label htmlFor="conversionRate" className="block text-sm font-medium mb-1 text-gray-600">Tasa de Conversión Estimada (Chat a Paciente) (%)</label>
                        <input id="conversionRate" type="number" min="0" max="100" step="1" value={conversionRate}
                          onChange={(e) => handleNumberInputChange(setConversionRate, 'conversionRate', e.target.value, 0, 100)}
                          className={`w-full p-2 border rounded transition duration-150 ${inputErrors.conversionRate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                           placeholder="ej., 98" />
                        <p className="text-xs text-gray-500 mt-1">Tasa de conversión final estimada para leads de chat.</p>
                        {inputErrors.conversionRate && (<p className="text-red-500 text-xs mt-1">Ingrese un valor entero entre 0 y 100.</p>)}
                      </div>
                      {/* Staff costs */}
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold mb-2 text-gray-600">Detalles del Personal Humano Actual (Status Quo)</h4>
                         <p className="text-xs text-gray-500 mb-3">Costo del personal si NO se implementa la solución WhatsApp IA.</p>
                        <div>
                          <label htmlFor="humanHourlyWage" className="block text-sm font-medium mb-1 text-gray-600">Salario Promedio por Hora ($ MXN)</label>
                          <input id="humanHourlyWage" type="number" min="0" step="1" value={humanHourlyWage}
                            onChange={(e) => handleNumberInputChange(setHumanHourlyWage, 'humanHourlyWage', e.target.value)}
                            className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHourlyWage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                            placeholder="ej., 80" />
                          {inputErrors.humanHourlyWage && (<p className="text-red-500 text-xs mt-1">Ingrese un número positivo.</p>)}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="humanHoursPerWeek" className="block text-sm font-medium mb-1 text-gray-600">Promedio de Horas Trabajadas por Semana</label>
                          <input id="humanHoursPerWeek" type="number" min="0" value={humanHoursPerWeek}
                            onChange={(e) => handleNumberInputChange(setHumanHoursPerWeek, 'humanHoursPerWeek', e.target.value)}
                            className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanHoursPerWeek ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                            placeholder="ej., 40" />
                          {inputErrors.humanHoursPerWeek && (<p className="text-red-500 text-xs mt-1">Ingrese un número positivo.</p>)}
                        </div>
                        <div className="mt-4">
                          <label htmlFor="humanOverheadPercentage" className="block text-sm font-medium mb-1 text-gray-600"> Gastos Generales Estimados (%) </label>
                          <input id="humanOverheadPercentage" type="number" min="0" max="200" step="1" value={humanOverheadPercentage}
                            onChange={(e) => handleNumberInputChange(setHumanOverheadPercentage, 'humanOverheadPercentage', e.target.value, 0, 200)}
                            className={`w-full p-2 border rounded transition duration-150 ${inputErrors.humanOverheadPercentage ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                            placeholder="ej., 20" />
                          <p className="text-xs text-gray-500 mt-1">Incluye beneficios (IMSS, INFONAVIT), impuestos, etc.</p>
                          {inputErrors.humanOverheadPercentage && (<p className="text-red-500 text-xs mt-1">Ingrese un porcentaje válido (ej. 0-200).</p>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                 {/* Botón Calcular */}
                 <div className="mt-6 no-print">
                    <button
                      onClick={() => { if (!validationError) { const resultsSection = document.getElementById('results-section'); if (resultsSection) { resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } }}
                      disabled={validationError}
                      className={`w-full font-bold py-3 px-4 rounded transition duration-200 ease-in-out text-white shadow-md hover:shadow-lg ${
                        validationError
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-800 cursor-pointer'
                      }`}
                    >
                      {validationError ? 'Por Favor Corrija los Errores Anteriores' : 'Calcular ROI de WhatsApp IA'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {validationError ? 'Corrija los campos resaltados.' : 'Calcule el impacto de implementar WhatsApp IA.'}
                    </p>
                  </div>
              </div> {/* Fin Columna Izquierda */}


              {/* Columna Derecha: Resultados */}
              <div id="results-section" className="space-y-6">
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">Análisis Mensual de Mensajes</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total Mensajes Manejados por IA (Est.):</span>
                      <span className="font-medium text-gray-900">{safeLocaleString(results.totalMessages, { maximumFractionDigits: 0 }, '0')}</span>
                    </div>
                    {/* Updated explanation for total messages calculation */}
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1">(Recibidos + (Recibidos * Tasa Perdida)) * 1.3</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Mensajes Perdidos Actualmente (Leads Est.):</span>
                      <span className="font-medium text-red-600">{safeLocaleString(results.missedMessages, { maximumFractionDigits: 1 }, '0.0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1">(Mensajes Hor. Com. x Tasa Perdida + Todos Fuera Hor.)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Oportunidades de Venta Perdidas (Leads Est.):</span>
                       <span className="font-medium text-red-700">{safeLocaleString(results.salesMissedMessages, { maximumFractionDigits: 1 }, '0.0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1">(Mensajes Perdidos × % Mensajes Nuevos Pacientes)</p>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
                      <span className="text-sm font-semibold text-red-700">Pacientes Nuevos Perdidos (Est.):</span>
                      <span className="font-semibold text-red-700">{safeLocaleString(results.convertedPatientsLost, { maximumFractionDigits: 1 }, '0.0')}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1">(Oportunidades Perdidas × Tasa Conversión Estimada)</p>
                     <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
                      <span className="text-sm font-semibold text-blue-700">Eficiencia de Automatización (Est.):</span>
                      <span className="font-semibold text-blue-700">{safeLocaleString(results.automationPercentage / 100, { style: 'percent' })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 pl-1">(% de mensajes manejados sin intervención humana)</p>
                  </CardContent>
                </Card>

                {/* AI Cost Card */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">Costo Plataforma WhatsApp IA ({pricingTiers[selectedTier]?.name} Nivel - MXN)</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Configuración API WhatsApp:</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiSetupFee, { style: 'decimal', minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Cuota Mensual Plataforma:</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiPlatformFee, { style: 'decimal', minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                      <span className="text-sm font-semibold text-gray-800">Costo Recurrente Mensual Total:</span>
                      <span className="font-semibold text-gray-800">${safeLocaleString(results.aiTotalMonthlyCost, { style: 'decimal', minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1">(Cuota Mensual de la Plataforma)</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700"> Costo Mensual Efectivo (Año 1): </span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.aiTotalCostWithSetup, { style: 'decimal', minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 pl-1">(Costo Mensual + Config. API/12)</p>
                  </CardContent>
                </Card>

                {/* Human Cost Card */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700">Costo Calculado del Personal Actual (Status Quo - MXN)</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-gray-50 p-4 rounded-b-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Costo Mensual Est. (Salarios + Gtos. Grales.):</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.humanCost, { style: 'decimal', minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1"> Basado en: ${safeLocaleString(humanHourlyWage, {style:'decimal', minimumFractionDigits:2})}/hr, {humanHoursPerWeek} hrs/sem, {humanOverheadPercentage}% gtos. grales.</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-700">Costo Anual Est. (Status Quo):</span>
                      <span className="font-medium text-gray-900">${safeLocaleString(results.humanCost * 12, { style: 'decimal', minimumFractionDigits: 2 })}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Impact Card */}
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Impacto Financiero Mensual (WhatsApp IA vs. Status Quo - MXN)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Ahorro Directo en Costos (vs. Personal Actual):</span>
                      <span className={`font-medium ${results.costSavings >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                         {results.costSavings < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.costSavings), { style: 'decimal', minimumFractionDigits: 2 })}
                       </span>
                    </div>
                    <p className="text-xs text-gray-600 -mt-2 mb-2 pl-1">(Costo Personal Actual - Costo Mensual Efectivo IA)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Ingresos Adicionales Potenciales (WhatsApp):</span>
                      <span className="font-medium text-green-700"> + ${safeLocaleString(results.potentialRevenue, { style: 'decimal', minimumFractionDigits: 2 })} </span>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2 mb-2 pl-1">(Oportunidades Perdidas (Leads) * Valor por Conversión)</p>
                    <div className="flex justify-between items-center border-t border-gray-300 pt-2 mt-2">
                      <span className="text-sm font-semibold text-gray-800">Beneficio Mensual Total (WhatsApp IA):</span>
                      <span className={`font-semibold text-xl ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {results.netBenefit < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.netBenefit), { style: 'decimal', minimumFractionDigits: 2 })}
                       </span>
                    </div>
                    <p className="text-xs text-gray-600 -mt-2 pl-1">(Ahorro en Costos + Ingresos Adicionales)</p>
                  </CardContent>
                </Card>

                {/* ROI Card */}
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">Retorno Potencial de la Inversión (ROI) - WhatsApp IA</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-center space-y-4">
                    <div>
                      <div className={`text-4xl font-bold ${results.roi >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                         {safeLocaleString(results.roi / 100, { style: 'percent', maximumFractionDigits: 0 }, 'N/A')}
                       </div>
                      <div className="text-sm text-gray-600">ROI Mensual</div>
                      <p className="text-xs text-gray-500 mt-1">(Beneficio Total / Costo Mensual Efectivo IA)</p>
                    </div>
                    <div>
                      <div className="text-md font-semibold text-gray-700">Período de Recuperación</div>
                      <div className="text-2xl font-bold text-green-700 mt-1"> {formatPaybackPeriod(results.paybackPeriod)} </div>
                      <p className="text-xs text-gray-500 mt-1">(Tiempo para recuperar Config. API inicial mediante Beneficio Neto)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart Card */}
                <Card className="border border-gray-200 print-shadow-none print-border-none">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-700 mb-1">Comparación Mensual de Costos y Beneficios (MXN)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={[ { name: 'Mensual', 'Costo Humano (Actual)': results.humanCost, 'Costo WhatsApp IA (Est.)': results.aiTotalCostWithSetup, 'Beneficio Neto Mensual': results.netBenefit > 0 ? results.netBenefit : 0 } ]}
                          margin={{ top: 5, right: 5, left: 25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4b5563' }} />
                          <YAxis tickFormatter={(value) => `$${safeLocaleString(value, {maximumFractionDigits: 0})}`} tick={{ fontSize: 10, fill: '#4b5563' }} width={80}/>
                          <Tooltip
                            formatter={(value, name) => [`$${safeLocaleString(value, { minimumFractionDigits: 2 })}`, name]}
                            labelFormatter={() => 'Comparación Mensual'}
                            cursor={{ fill: 'rgba(200, 200, 200, 0.3)' }}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderColor: '#d1d5db' }}
                            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                            itemStyle={{ color: '#374151' }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px', color: '#4b5563' }} />
                          <Bar dataKey="Costo Humano (Actual)" fill="#ef4444" name="Costo Humano (Actual)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Costo WhatsApp IA (Est.)" fill="#6b7280" name="Costo WhatsApp IA (Incl. Config./12)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Beneficio Neto Mensual" fill="#16a34a" name="Beneficio Neto Mensual" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

              </div> {/* Fin Columna Derecha */}
            </div> {/* Fin Grid */}

            {/* --- Key Insights & Qualitative Sections --- */}
            <div className="mt-8">
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                   <CardHeader> <CardTitle className="text-lg font-semibold text-gray-800">Perspectivas Clave y Proyecciones Anuales (WhatsApp IA - MXN)</CardTitle> </CardHeader>
                   <CardContent className="p-4 space-y-4 text-sm">
                     {results.yearlyPotentialRevenue > 0 && (
                       <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                           <p className="font-medium text-gray-800 mb-1"> Ingresos Anuales Adicionales Potenciales (WhatsApp): <span className="text-xs text-gray-500 font-normal ml-1">(Primer Año)</span> </p>
                           <p className={`text-xl font-semibold text-green-600`}> ${safeLocaleString(results.yearlyPotentialRevenue, { style: 'decimal', minimumFractionDigits: 2 })} </p>
                           <p className="text-xs text-gray-500 mt-1">(Ingresos Est. por Mensajes Perdidos Capturados x 12)</p>
                       </div>
                     )}
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                         <p className="font-medium text-gray-800 mb-1">Beneficio Anual Potencial (Continuo):</p>
                          <p className={`text-xl font-semibold ${results.yearlyNetBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {results.yearlyNetBenefit < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.yearlyNetBenefit), { style: 'decimal', minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">(Ahorro Anual Recurrente + Ingresos Anuales Adicionales)</p>
                     </div>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                         <p className="font-medium text-gray-800 mb-1">Retorno Neto del Primer Año (WhatsApp IA):</p>
                          <p className={`text-xl font-semibold ${results.firstYearNetReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {results.firstYearNetReturn < 0 ? '- ' : ''}${safeLocaleString(Math.abs(results.firstYearNetReturn), { style: 'decimal', minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">(Beneficio Anual Potencial - Configuración API Inicial)</p>
                     </div>
                     <ul className="list-disc pl-5 space-y-2 text-gray-700">
                         <li> La solución WhatsApp IA proyecta un<span className={`font-semibold ${results.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}> {results.netBenefit >= 0 ? ' beneficio ' : ' costo '} neto mensual de ${safeLocaleString(Math.abs(results.netBenefit), { style: 'decimal', minimumFractionDigits: 2 })} </span> (vs. status quo). </li>
                         {(results.paybackPeriod > 0 && isFinite(results.paybackPeriod)) && ( <li> La inversión inicial (configuración API de ${safeLocaleString(results.aiSetupFee, { style: 'decimal', minimumFractionDigits: 0 })}) se estima recuperar en <span className="font-semibold text-green-700"> {formatPaybackPeriod(results.paybackPeriod)}</span>.</li> )}
                          {(!isFinite(results.paybackPeriod) || results.paybackPeriod < 0) && results.netBenefit <= 0 && ( <li> Con los datos actuales, no se proyecta recuperar la inversión inicial a través de los beneficios netos. </li> )}
                         {results.potentialRevenue > 0 && ( <li> Capturar mensajes perdidos podría generar <span className="font-semibold text-green-600"> ${safeLocaleString(results.potentialRevenue, { style: 'decimal', minimumFractionDigits: 2 })}</span> en ingresos mensuales adicionales, recuperando un estimado de <span className="font-semibold text-green-600">{safeLocaleString(results.convertedPatientsLost, {maximumFractionDigits: 1})}</span> pacientes/clientes al mes. </li> )}
                         {results.costSavings !== 0 && ( <li> Comparado al costo del personal actual, WhatsApp IA representa un<span className={`font-semibold ${results.costSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}> {results.costSavings >= 0 ? ' ahorro ' : ' costo adicional '} mensual de ${safeLocaleString(Math.abs(results.costSavings), { style: 'decimal', minimumFractionDigits: 2 })} </span>. </li> )}
                         {isFinite(results.roi) && !isNaN(results.roi) && results.roi !== 0 && ( <li> Esto se traduce en un ROI mensual potencial de <span className={`font-semibold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}> {safeLocaleString(results.roi / 100, { style: 'percent', maximumFractionDigits: 0 }, 'N/A')} </span>. </li> )}
                         <li> Comparando solo los ingresos adicionales anuales vs el costo total de WhatsApp IA del primer año resulta en una <span className={`font-semibold ${results.firstYearRevenueVsAiCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>{results.firstYearRevenueVsAiCost >=0 ? 'ganancia' : 'pérdida'} neta de ${safeLocaleString(Math.abs(results.firstYearRevenueVsAiCost), {style: 'decimal', minimumFractionDigits: 2 })}</span> (sin incluir ahorros de personal).</li>
                     </ul>
                   </CardContent>
                </Card>
            </div>

             {/* Qualitative Benefits */}
            <div className="mt-8">
                <Card className="border border-gray-300 bg-gray-100 print-shadow-none print-border-none">
                    <CardHeader> <CardTitle className="text-lg font-semibold text-gray-800">Beneficios Potenciales Adicionales (WhatsApp IA)</CardTitle> </CardHeader>
                    <CardContent className="p-4 text-sm text-gray-700">
                        <p className="mb-3 text-gray-800">Más allá de las métricas, considera cómo una solución de WhatsApp IA mejora la operación:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li> <span className="font-medium text-gray-900">Disponibilidad 24/7:</span> Respuestas automáticas instantáneas a consultas frecuentes fuera de horario, mejorando la accesibilidad y satisfacción del paciente.</li>
                            <li> <span className="font-medium text-gray-900">Comunicación Preferida:</span> Interactúa con pacientes en su canal preferido, aumentando la tasa de apertura y respuesta comparado con email o llamadas.</li>
                            <li> <span className="font-medium text-gray-900">Reducción de No Presentaciones:</span> Envío automatizado de recordatorios de citas efectivos que disminuyen significativamente las ausencias.</li>
                            <li> <span className="font-medium text-gray-900">Eficiencia del Personal:</span> Automatiza hasta el 70-75% de las interacciones, liberando al personal para tareas de mayor valor y reduciendo la necesidad de agentes dedicados exclusivamente a responder mensajes básicos.</li>
                            <li> <span className="font-medium text-gray-900">Comunicación Asíncrona:</span> Permite a pacientes y personal responder cuando les es conveniente, eliminando la frustración de llamadas perdidas o largas esperas.</li>
                            <li> <span className="font-medium text-gray-900">Capacidad Multimedia:</span> Facilita el envío de fotos, videos o documentos relevantes para consultas o seguimientos, enriqueciendo la comunicación.</li>
                            <li> <span className="font-medium text-gray-900">Triage y Calificación:</span> La IA puede realizar un triage inicial o calificar leads, dirigiendo eficientemente a los pacientes al servicio o personal adecuado.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Print Button */}
            <div className="mt-8 text-center no-print">
              <button onClick={handlePrint} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out shadow hover:shadow-md"> Imprimir Resultados </button>
              <p className="text-xs text-gray-500 mt-2"> Use el diálogo de impresión de su navegador para guardar como PDF. </p>
            </div>

          </CardContent>
        </Card>
      </div> {/* End Printable Area */}
    </>
  );
}

// Export the component as default App
export default App;
