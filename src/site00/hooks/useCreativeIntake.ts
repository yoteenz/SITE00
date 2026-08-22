import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MarketingServiceCategory } from '../../../shared/site00-marketing/types.js';
import { getCreativeIntakeExperience } from '../../../shared/site00-marketing/creativeIntake/experienceRegistry.js';
import { draftStorageKey, validateStage } from '../../../shared/site00-marketing/creativeIntake/validation.js';
import type { CreativeIntakeDraft } from '../../../shared/site00-marketing/creativeIntake/types.js';

export function useCreativeIntake(serviceId: MarketingServiceCategory) {
  const experience = useMemo(() => getCreativeIntakeExperience(serviceId), [serviceId]);
  const [stageIndex, setStageIndex] = useState(0);
  const [form, setForm] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [draftRecovered, setDraftRecovered] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftStorageKey(serviceId));
      if (!raw) return;
      const draft = JSON.parse(raw) as CreativeIntakeDraft;
      if (draft.serviceId === serviceId) {
        setForm(draft.form);
        setStageIndex(draft.stageIndex);
        setDraftRecovered(true);
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, [serviceId]);

  useEffect(() => {
    const draft: CreativeIntakeDraft = {
      serviceId,
      stageIndex,
      form,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(draftStorageKey(serviceId), JSON.stringify(draft));
    } catch {
      /* quota exceeded — non-fatal */
    }
  }, [serviceId, stageIndex, form]);

  const updateField = useCallback((id: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors([]);
  }, []);

  const goNext = useCallback(() => {
    const result = validateStage(experience, stageIndex, form);
    if (!result.ok) {
      setErrors(result.errors);
      return false;
    }
    setStageIndex((i) => Math.min(i + 1, experience.stages.length - 1));
    setErrors([]);
    return true;
  }, [experience, stageIndex, form]);

  const goBack = useCallback(() => {
    setStageIndex((i) => Math.max(0, i - 1));
    setErrors([]);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftStorageKey(serviceId));
  }, [serviceId]);

  const stage = experience.stages[stageIndex];
  const isLast = stageIndex >= experience.stages.length - 1;
  const progress = ((stageIndex + 1) / experience.stages.length) * 100;

  return {
    experience,
    stage,
    stageIndex,
    form,
    errors,
    draftRecovered,
    isLast,
    progress,
    updateField,
    goNext,
    goBack,
    clearDraft,
    setErrors,
  };
}
