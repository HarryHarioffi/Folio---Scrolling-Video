/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import SectionHeader from "../SectionHeader";
import WorkRow from "../ui/WorkRow";
import { WORK_CASE_STUDIES } from "../../data/content";

export default function WorkSection() {
  const [expandedIndex, setExpandedIndex] = useState<string | null>("01");

  return (
    <section id="work" className="video-blend-stage px-5 sm:px-8 md:px-12 py-24 md:py-40 z-10 relative">
      <SectionHeader label="// SELECTED WORK" title="Outcome-led design for teams building serious software." adaptiveText />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Left column — empty space for video */}
        <div className="hidden md:block md:col-span-5" />

        {/* Right column — Content */}
        <div className="md:col-span-7 flex flex-col">
          <div className="flex flex-col border-b border-border-custom mt-6">
            {WORK_CASE_STUDIES.map(({ index, category, title, deliverables, impact }) => (
              <WorkRow
                key={index}
                index={index}
                category={category}
                title={title}
                deliverables={deliverables}
                impact={impact}
                isExpanded={expandedIndex === index}
                onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
