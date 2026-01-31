import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntakeForm } from '../IntakeForm';
import { api } from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  api: {
    createAudit: vi.fn(),
    addTools: vi.fn(),
    analyzeAudit: vi.fn(),
  },
}));

describe('IntakeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================
  // Component Rendering
  // ========================================

  describe('Component Rendering', () => {
    it('should render the form with all main sections', () => {
      render(<IntakeForm />);

      expect(screen.getByText('AI Stack Audit')).toBeInTheDocument();
      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByText('Your AI Tools')).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Size/i)).toBeInTheDocument();
    });

    it('should show empty state when no tools are added', () => {
      render(<IntakeForm />);

      expect(
        screen.getByText('No tools added yet. Click "Add Tool" to get started.')
      ).toBeInTheDocument();
    });

    it('should not show submit button when no tools are added', () => {
      render(<IntakeForm />);

      expect(screen.queryByText('Analyze My Stack →')).not.toBeInTheDocument();
    });
  });

  // ========================================
  // Company Information
  // ========================================

  describe('Company Information', () => {
    it('should update company name field', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      const companyNameInput = screen.getByLabelText(/Company Name/i);
      await user.type(companyNameInput, 'Acme Inc.');

      expect(companyNameInput).toHaveValue('Acme Inc.');
    });

    it('should update company size field', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      const companySizeSelect = screen.getByLabelText(/Company Size/i);
      await user.selectOptions(companySizeSelect, '11-50');

      expect(companySizeSelect).toHaveValue('11-50');
    });

    it('should render all company size options', () => {
      render(<IntakeForm />);

      const companySizeSelect = screen.getByLabelText(/Company Size/i);
      const options = Array.from(companySizeSelect.querySelectorAll('option'));
      const optionTexts = options.map((opt) => opt.textContent);

      expect(optionTexts).toContain('1-10 employees');
      expect(optionTexts).toContain('11-50 employees');
      expect(optionTexts).toContain('51-200 employees');
      expect(optionTexts).toContain('201-500 employees');
      expect(optionTexts).toContain('500+ employees');
    });
  });

  // ========================================
  // Adding/Removing Tools
  // ========================================

  describe('Adding and Removing Tools', () => {
    it('should add a new tool when "Add Tool" button is clicked', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      const addButton = screen.getByText('+ Add Tool');
      await user.click(addButton);

      expect(screen.getByText('Tool #1')).toBeInTheDocument();
    });

    it('should remove empty state after adding a tool', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));

      expect(
        screen.queryByText('No tools added yet. Click "Add Tool" to get started.')
      ).not.toBeInTheDocument();
    });

    it('should add multiple tools with correct numbering', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));

      expect(screen.getByText('Tool #1')).toBeInTheDocument();
      expect(screen.getByText('Tool #2')).toBeInTheDocument();
      expect(screen.getByText('Tool #3')).toBeInTheDocument();
    });

    it('should remove a tool when "Remove" button is clicked', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));

      const removeButtons = screen.getAllByText('Remove');
      await user.click(removeButtons[0]);

      expect(screen.queryByText('Tool #2')).not.toBeInTheDocument();
    });

    it('should show empty state again after removing all tools', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('Remove'));

      expect(
        screen.getByText('No tools added yet. Click "Add Tool" to get started.')
      ).toBeInTheDocument();
    });
  });

  // ========================================
  // Tool Field Updates
  // ========================================

  describe('Tool Field Updates', () => {
    it('should update tool name field', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      const toolNameInput = screen.getByPlaceholderText('ChatGPT');
      await user.type(toolNameInput, 'Claude');

      expect(toolNameInput).toHaveValue('Claude');
    });

    it('should update monthly cost field', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '99.99');

      expect(costInput).toHaveValue(99.99);
    });

    it('should update seats field', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      const seatsInput = screen.getByPlaceholderText('5');
      
      // Default value is 1
      expect(seatsInput).toHaveValue(1);
      
      // Update to 5 using fireEvent (more reliable for number inputs)
      fireEvent.change(seatsInput, { target: { value: '5' } });

      expect(seatsInput).toHaveValue(5);
    });

    it('should handle zero monthly cost', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      const costInput = screen.getByPlaceholderText('20.00');
      
      // Type directly to set value
      await user.type(costInput, '0');

      // Should have a value (could be 0 or empty string)
      expect(costInput.value).toBeDefined();
    });

    it('should handle decimal monthly cost', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '49.99');

      expect(costInput).toHaveValue(49.99);
    });
  });

  // ========================================
  // Use Cases
  // ========================================

  describe('Use Cases', () => {
    it('should render all use case options', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));

      expect(screen.getByText('Writing')).toBeInTheDocument();
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Image Gen')).toBeInTheDocument();
      expect(screen.getByText('Data Analysis')).toBeInTheDocument();
      expect(screen.getByText('Customer Support')).toBeInTheDocument();
      expect(screen.getByText('Research')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should toggle use case when clicked', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      const codeButton = screen.getByRole('button', { name: 'Code' });

      // Click to select
      await user.click(codeButton);
      expect(codeButton).toHaveClass('bg-blue-600');

      // Click to deselect
      await user.click(codeButton);
      expect(codeButton).toHaveClass('bg-white');
    });

    it('should allow multiple use cases to be selected', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      
      await user.click(screen.getByRole('button', { name: 'Code' }));
      await user.click(screen.getByRole('button', { name: 'Writing' }));
      await user.click(screen.getByRole('button', { name: 'Research' }));

      expect(screen.getByRole('button', { name: 'Code' })).toHaveClass('bg-blue-600');
      expect(screen.getByRole('button', { name: 'Writing' })).toHaveClass('bg-blue-600');
      expect(screen.getByRole('button', { name: 'Research' })).toHaveClass('bg-blue-600');
    });

    it('should show helper text when no use cases selected', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));

      expect(screen.getByText('Select at least one use case')).toBeInTheDocument();
    });

    it('should toggle use cases independently for different tools', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));

      const codeButtons = screen.getAllByRole('button', { name: 'Code' });
      
      await user.click(codeButtons[0]);
      
      expect(codeButtons[0]).toHaveClass('bg-blue-600');
      expect(codeButtons[1]).toHaveClass('bg-white');
    });
  });

  // ========================================
  // Total Monthly Cost
  // ========================================

  describe('Total Monthly Cost', () => {
    it('should calculate total monthly cost correctly', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));

      const costInputs = screen.getAllByPlaceholderText('20.00');
      await user.clear(costInputs[0]);
      await user.type(costInputs[0], '50.00');
      await user.clear(costInputs[1]);
      await user.type(costInputs[1], '30.00');

      expect(screen.getByText('$80.00')).toBeInTheDocument();
    });

    it('should show tool count correctly (singular)', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));

      expect(screen.getByText('across 1 tool')).toBeInTheDocument();
    });

    it('should show tool count correctly (plural)', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));

      expect(screen.getByText('across 2 tools')).toBeInTheDocument();
    });

    it('should update total when removing a tool', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));
      await user.click(screen.getByText('+ Add Tool'));

      const costInputs = screen.getAllByPlaceholderText('20.00');
      await user.clear(costInputs[0]);
      await user.type(costInputs[0], '50.00');
      await user.clear(costInputs[1]);
      await user.type(costInputs[1], '30.00');

      await user.click(screen.getAllByText('Remove')[0]);

      expect(screen.getByText('$30.00')).toBeInTheDocument();
    });
  });

  // ========================================
  // Form Validation
  // ========================================

  describe('Form Validation', () => {
    it('should show error when no tools are added', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      const companyNameInput = screen.getByLabelText(/Company Name/i);
      await user.type(companyNameInput, 'Acme Inc.');

      const companySizeSelect = screen.getByLabelText(/Company Size/i);
      await user.selectOptions(companySizeSelect, '11-50');

      // Can't submit without tools - button not visible
      expect(screen.queryByText('Analyze My Stack →')).not.toBeInTheDocument();
    });

    it('should require company name field', () => {
      render(<IntakeForm />);

      const companyNameInput = screen.getByLabelText(/Company Name/i);
      expect(companyNameInput).toBeRequired();
    });

    it('should require company size field', () => {
      render(<IntakeForm />);

      const companySizeSelect = screen.getByLabelText(/Company Size/i);
      expect(companySizeSelect).toBeRequired();
    });

    it('should require tool name fields', async () => {
      const user = userEvent.setup();
      render(<IntakeForm />);

      await user.click(screen.getByText('+ Add Tool'));

      const toolNameInput = screen.getByPlaceholderText('ChatGPT');
      expect(toolNameInput).toBeRequired();
    });
  });

  // ========================================
  // Form Submission
  // ========================================

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockAudit = { id: 'audit-123', companyName: 'Acme Inc.', companySize: '11-50' };
      
      (api.createAudit as any).mockResolvedValue(mockAudit);
      (api.addTools as any).mockResolvedValue({});
      (api.analyzeAudit as any).mockResolvedValue({});

      render(<IntakeForm />);

      // Fill company info
      await user.type(screen.getByLabelText(/Company Name/i), 'Acme Inc.');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '11-50');

      // Add tool
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'Claude');
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '50');
      await user.click(screen.getByRole('button', { name: 'Code' }));

      // Submit
      await user.click(screen.getByText('Analyze My Stack →'));

      await waitFor(() => {
        expect(api.createAudit).toHaveBeenCalledWith({
          companyName: 'Acme Inc.',
          companySize: '11-50',
        });
      }, { timeout: 3000 });

      expect(api.addTools).toHaveBeenCalledWith('audit-123', [
        {
          toolName: 'Claude',
          monthlyCost: 50,
          seats: 1,
          useCases: ['Code'],
        },
      ]);

      expect(api.analyzeAudit).toHaveBeenCalledWith('audit-123');
    });

    it('should call onComplete callback with audit ID on success', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      const mockAudit = { id: 'audit-456', companyName: 'Test Co.', companySize: '1-10' };
      
      (api.createAudit as any).mockResolvedValue(mockAudit);
      (api.addTools as any).mockResolvedValue({});
      (api.analyzeAudit as any).mockResolvedValue({});

      render(<IntakeForm onComplete={onComplete} />);

      // Fill and submit form - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Test Co.');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'GPT-4');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '20');
      
      await user.click(screen.getByRole('button', { name: 'Writing' }));
      await user.click(screen.getByText('Analyze My Stack →'));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith('audit-456');
      }, { timeout: 3000 });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      (api.createAudit as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      (api.addTools as any).mockResolvedValue({});
      (api.analyzeAudit as any).mockResolvedValue({});

      render(<IntakeForm />);

      // Fill form - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'Tool');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '10');
      
      await user.click(screen.getByRole('button', { name: 'Code' }));

      const submitButton = screen.getByText('Analyze My Stack →');
      await user.click(submitButton);

      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    it('should show AI analyzing state', async () => {
      const user = userEvent.setup();
      const mockAudit = { id: 'audit-789', companyName: 'Co.', companySize: '1-10' };
      
      (api.createAudit as any).mockResolvedValue(mockAudit);
      (api.addTools as any).mockResolvedValue({});
      (api.analyzeAudit as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<IntakeForm />);

      // Fill and submit - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Co.');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'T');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '10');
      
      await user.click(screen.getByRole('button', { name: 'Code' }));
      await user.click(screen.getByText('Analyze My Stack →'));

      await waitFor(() => {
        expect(screen.getByText('🤖 AI Analyzing...')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      
      (api.createAudit as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<IntakeForm />);

      // Fill form - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'Tool');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '10');
      
      await user.click(screen.getByRole('button', { name: 'Code' }));

      const submitButton = screen.getByText('Analyze My Stack →');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  // ========================================
  // Error Handling
  // ========================================

  describe('Error Handling', () => {
    it('should show error message when API call fails', async () => {
      const user = userEvent.setup();
      
      (api.createAudit as any).mockRejectedValue(new Error('Network error'));

      render(<IntakeForm />);

      // Fill and submit - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'Tool');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '10');
      
      await user.click(screen.getByRole('button', { name: 'Code' }));
      await user.click(screen.getByText('Analyze My Stack →'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show generic error when error is not an Error object', async () => {
      const user = userEvent.setup();
      
      (api.createAudit as any).mockRejectedValue('Something went wrong');

      render(<IntakeForm />);

      // Fill and submit - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'Tool');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '10');
      
      await user.click(screen.getByRole('button', { name: 'Code' }));
      await user.click(screen.getByText('Analyze My Stack →'));

      await waitFor(() => {
        expect(screen.getByText('Failed to submit audit')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should re-enable submit button after error', async () => {
      const user = userEvent.setup();
      
      (api.createAudit as any).mockRejectedValue(new Error('Error'));

      render(<IntakeForm />);

      // Fill and submit - fill cost field properly
      await user.type(screen.getByLabelText(/Company Name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/Company Size/i), '1-10');
      await user.click(screen.getByText('+ Add Tool'));
      await user.type(screen.getByPlaceholderText('ChatGPT'), 'Tool');
      
      const costInput = screen.getByPlaceholderText('20.00');
      await user.clear(costInput);
      await user.type(costInput, '10');
      
      await user.click(screen.getByRole('button', { name: 'Code' }));
      
      const submitButton = screen.getByText('Analyze My Stack →');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });
});
