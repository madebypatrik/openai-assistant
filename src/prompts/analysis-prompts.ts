import { AnalysisPrompts } from '../types/index.js';

export const analysisPrompts: AnalysisPrompts = {
  // Generic prompts that work for any document type
  overview: `Please analyze this document and provide a comprehensive overview that includes:
1. Document type and scope
2. Key objectives and main findings
3. Major achievements, results, or conclusions from the reporting period
4. Forward-looking statements or future outlook
5. Key risks, limitations, or challenges identified

Format the response with clear headings and bullet points for easy reading.`,

  keyResults: `Please analyze the main results section and provide:
1. Primary outcomes and key metrics (with specific numbers where available)
2. Performance indicators and success criteria
3. Year-over-year or period-to-period comparisons and trends
4. Key highlights and significant findings
5. Notable exceptions, adjustments, or one-time items

Include specific numbers, percentages, and statistical significance where available.`,

  methodology: `Please analyze the methodology, design, or operational aspects and provide insights on:
1. Approach, methodology, or business model used
2. Key parameters, variables, or operational metrics
3. Quality measures and validation approaches
4. Structural analysis and component breakdown
5. Process changes or improvements from previous periods

Present the data in a structured format with key metrics highlighted.`,

  impact: `Please analyze the broader impact and implications and provide:
1. Primary impact and significance of findings
2. Secondary effects and broader implications
3. Resource utilization and efficiency measures
4. Strategic positioning and competitive advantages
5. Long-term trends and sustainability indicators

Highlight any concerns or positive indicators regarding future prospects.`
};

// Document-type specific prompt sets
export const documentTypePrompts = {
  research: {
    overview: `Please analyze this research document and provide a comprehensive overview that includes:
1. Research objectives and hypothesis
2. Study design and methodology approach
3. Key findings and research contributions
4. Limitations and future research directions
5. Scientific and clinical implications

Format the response with clear headings and bullet points for easy reading.`,

    keyResults: `Please analyze the research results and provide:
1. Primary research outcomes and key findings
2. Statistical analysis and significance measures
3. Data trends and pattern identification
4. Research validation and reproducibility factors
5. Notable discoveries or unexpected results

Include specific numbers, percentages, and statistical measures where available.`,

    methodology: `Please analyze the research methodology and provide insights on:
1. Research design and experimental approach
2. Data collection methods and sample characteristics
3. Statistical analysis methods and validation techniques
4. Quality control measures and bias mitigation
5. Methodological strengths and limitations

Present the methodology in a structured format highlighting key research elements.`,

    impact: `Please analyze the research and scientific implications and provide:
1. Scientific contribution and advancement to the field
2. Clinical applications and translational potential
3. Research impact and citation-worthy findings
4. Future research directions and opportunities
5. Broader scientific and medical community implications

Highlight key research insights and potential impact on scientific knowledge.`
  },

  clinical: {
    overview: `Please analyze this clinical trial document and provide a comprehensive overview that includes:
1. Study design, population, and objectives
2. Primary and secondary endpoints
3. Key findings and clinical significance
4. Safety profile and adverse events
5. Regulatory and commercial implications

Format the response with clear headings and bullet points for easy reading.`,

    keyResults: `Please analyze the clinical results and provide:
1. Primary endpoint results with statistical significance (p-values, confidence intervals)
2. Secondary endpoint outcomes and subgroup analyses
3. Efficacy measurements and clinical benefits
4. Response rates, survival data, or other key metrics
5. Comparison to historical controls or benchmarks

Include specific numbers, percentages, and statistical measures where available.`,

    methodology: `Please analyze the study methodology and design and provide insights on:
1. Study design (randomized, controlled, blinded, etc.)
2. Patient population characteristics and eligibility criteria
3. Sample size, power calculations, and statistical methods
4. Treatment protocols and dosing regimens
5. Quality measures and data integrity assessments

Present the methodology in a structured format highlighting key design elements.`,

    impact: `Please analyze the clinical and healthcare implications and provide:
1. Clinical significance and differentiation from existing treatments
2. Patient benefit and therapeutic advancement potential
3. Healthcare system integration and treatment protocol implications
4. Real-world clinical applicability and implementation considerations
5. Long-term patient outcomes and quality of life impact
6. Safety profile and risk-benefit considerations

Highlight key clinical insights and potential impact on patient care and medical practice.`
  }
};

