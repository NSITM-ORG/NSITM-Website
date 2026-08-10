/**
 * useEnrollmentForm — Context+useReducer-driven state machine for the
 * 4-step enrollment form (build instruction #2: Context API/useReducer
 * for in-house complex component state).
 *
 * This is intentionally NOT part of useManageState/Redux — the raw
 * in-progress form field values (name typed so far, which checkboxes are
 * ticked, etc.) are ephemeral, single-page, single-component-tree state
 * that never needs to be read from outside the EnrollmentPage subtree.
 * Only the SERVER-CONFIRMED result (partialEnrollmentId) lives in Redux
 * (enrollmentSlice), because that's the piece other parts of the app
 * conceivably care about (e.g. re-entry after a page reload).
 *
 * Exposes a Provider + a consumer hook, following the standard Context
 * pair pattern. Mounted once at the top of EnrollmentPage (Batch F7).
 */

import { createContext, useCallback, useContext, useReducer } from 'react';

const STEP = { PERSONAL: 1, POLICY: 2, PAYMENT: 3, RECEIPT: 4 };

// FIND the initialFormState object and ADD:
const initialFormState = {
  step: STEP.PERSONAL,
  fullName: '',
  phoneNumber: '',
  whatsappNumber: '',
  emailAddress: '',
  programme: '',
  cohortId: null,        // NEW — set alongside programme when prefilled
  isPrefilled: false,    // NEW — true when arrived via ?programme=slug
  resolvedProgramme: null,
  deliveryFormat: '',
  referralCode: '',
  policies: { /* unchanged */ noRefundPolicy: false, attendancePolicy: false, codeOfConduct: false, paymentPlanTerms: false },
  paymentType: '',
  transferConfirmed: false,
};

function enrollmentFormReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_POLICY':
      return { ...state, policies: { ...state.policies, [action.field]: action.value } };
    case 'RESET_POLICIES':
      return { ...state, policies: initialFormState.policies };
    case 'GO_TO_STEP':
      return { ...state, step: action.step };
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, STEP.RECEIPT) };
    case 'PREVIOUS_STEP':
      return { ...state, step: Math.max(state.step - 1, STEP.PERSONAL) };
    /**
     * Per FRD FR-02.2: if the programme changes AFTER Step 1 (user goes
     * back and picks a different programme), the Step 2 policy
     * acknowledgments must be cleared and re-acknowledged.
     */
    case 'CHANGE_PROGRAMME_MID_FORM':
      return { ...state, programme: action.programme, policies: initialFormState.policies };
    case 'PREFILL_FROM_QUERY':
      return { ...state, programme: action.programme, cohortId: action.cohortId || null, isPrefilled: true };
    case 'SET_RESOLVED_PROGRAMME':
      return {
        ...state,
        programme: action.programme.id,
        resolvedProgramme: action.programme,
        cohortId: action.cohortId || action.programme.activeCohort?.id || null,
        isPrefilled: true,
      };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

const EnrollmentFormContext = createContext(null);

export function EnrollmentFormProvider({ children }) {
  const [state, dispatch] = useReducer(enrollmentFormReducer, initialFormState);

  const setField = useCallback((field, value) => dispatch({ type: 'SET_FIELD', field, value }), []);
  const setPolicy = useCallback((field, value) => dispatch({ type: 'SET_POLICY', field, value }), []);
  const goToStep = useCallback((step) => dispatch({ type: 'GO_TO_STEP', step }), []);
  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const previousStep = useCallback(() => dispatch({ type: 'PREVIOUS_STEP' }), []);
  const changeProgrammeMidForm = useCallback(
    (programme) => dispatch({ type: 'CHANGE_PROGRAMME_MID_FORM', programme }),
    []
  );
  const prefillFromQuery = useCallback(
    (programme, cohortId) => dispatch({ type: 'PREFILL_FROM_QUERY', programme, cohortId }),
    []
  );
  const setResolvedProgramme = useCallback(
    (programme, cohortId) => dispatch({ type: 'SET_RESOLVED_PROGRAMME', programme, cohortId }),
    []
  );
  const resetForm = useCallback(() => dispatch({ type: 'RESET' }), []);

  const allPoliciesChecked = Object.values(state.policies).every(Boolean);

  const value = {
    state,
    STEP,
    setField,
    setPolicy,
    goToStep,
    nextStep,
    previousStep,
    changeProgrammeMidForm,
    prefillFromQuery,
    setResolvedProgramme, 
    resetForm,
    allPoliciesChecked,
  };

  return <EnrollmentFormContext.Provider value={value}>{children}</EnrollmentFormContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEnrollmentForm() {
  const ctx = useContext(EnrollmentFormContext);
  if (!ctx) {
    throw new Error('useEnrollmentForm must be used within an EnrollmentFormProvider.');
  }
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export default useEnrollmentForm;