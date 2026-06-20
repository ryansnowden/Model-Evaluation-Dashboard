import React from 'react';
import { render, screen } from '@testing-library/react';
import FailureAnalysis from './FailureAnalysis';
import { IncidentTrace, ModelConfig } from '../types';

const mockTraces: IncidentTrace[] = [];
const mockModels: ModelConfig[] = [];

describe('FailureAnalysis', () => {
  it('should render interactive category filters', () => {
    render(<FailureAnalysis traces={mockTraces} models={mockModels} selectedModels={[]} />);
    
    expect(screen.getByTestId('category-filters')).toBeInTheDocument();
  });
});
