# 18 · Motion and layering QA

* **Parent → child shared element.** The tapped parent paper morphs into the page's own art: `view-transition-name:
  jrn-place` is on 02's CURRENT BALANCE paper and on the **scene band** of 03 / 04 / 05 (previously the generic stats
  paper). One element per page carries the name (unit test A1).
* **Settle.** Scene band (order 0), 03's seal (1) and strip papers (3 + i) are `.jrn-d01__layer`s and settle in the
  frame's existing stagger; live text fades in after; strip buttons slide in by index. No new animation was added.
* **Reduced motion.** `prefers-reduced-motion: reduce` disables every animation (E2E `reduced motion › no animation
  runs; pages, overlays and saves still work`, report 12).
* **Layer order** (bottom → top): SK02 field → scene band → seal → heading / title → live figures and rows → strip papers
  → strip buttons → chips → overlays (sheets, Pocket menu). Live text is never under art; the first strip paper covers
  the band's alpha foot.
* **Tall phones.** The band stays fixed under the title paper; text anchored to it (`on` = band top) moves with it;
  the first row stays seated on the band's foot; the extra opens between rows and above the landscape (report 13).
* **No flat screenshot.** The band carries art only; every figure and action is DOM (`d01-balance` carries cents).
* **Remaining:** the keychain / amphora / coin cannot animate independently (flattened in their band; native layers
  requested, report 07).
