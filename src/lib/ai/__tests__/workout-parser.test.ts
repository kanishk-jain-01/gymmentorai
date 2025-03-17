import { parseWorkoutText, normalizeWorkoutText } from '../workout-parser';
import { callLLM } from '../llm-client';
import { isAIAvailable } from '../llm-config';

// Mock dependencies
jest.mock('../llm-client');
jest.mock('../llm-config');

describe('Workout Parser', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock isAIAvailable to return true
    (isAIAvailable as jest.Mock).mockReturnValue(true);
  });
  
  describe('normalizeWorkoutText', () => {
    it('should convert kg to lbs', async () => {
      // Mock the LLM response for tool calling
      (callLLM as jest.Mock).mockImplementation((messages, options) => {
        if (options.tools) {
          // First call with tools
          return {
            choices: [{
              message: {
                content: 'I need to convert 50kg to lbs',
                tool_calls: [
                  {
                    id: 'call_1',
                    function: {
                      name: 'convertWeight',
                      arguments: JSON.stringify({ value: 50, unit: 'kg' })
                    }
                  }
                ]
              }
            }]
          };
        } else {
          // Follow-up call with tool results
          return {
            choices: [{
              message: {
                content: '3 sets of 10 squats with 110lbs'
              }
            }]
          };
        }
      });
      
      const result = await normalizeWorkoutText('3 sets of 10 squats with 50kg');
      expect(result).toBe('3 sets of 10 squats with 110lbs');
      expect(callLLM).toHaveBeenCalledTimes(2);
    });
    
    it('should convert km to meters', async () => {
      // Mock the LLM response for tool calling
      (callLLM as jest.Mock).mockImplementation((messages, options) => {
        if (options.tools) {
          // First call with tools
          return {
            choices: [{
              message: {
                content: 'I need to convert 5km to meters',
                tool_calls: [
                  {
                    id: 'call_1',
                    function: {
                      name: 'convertDistance',
                      arguments: JSON.stringify({ value: 5, unit: 'km' })
                    }
                  }
                ]
              }
            }]
          };
        } else {
          // Follow-up call with tool results
          return {
            choices: [{
              message: {
                content: 'Ran for 5000 meters'
              }
            }]
          };
        }
      });
      
      const result = await normalizeWorkoutText('Ran for 5km');
      expect(result).toBe('Ran for 5000 meters');
      expect(callLLM).toHaveBeenCalledTimes(2);
    });
    
    it('should convert time formats to seconds', async () => {
      // Mock the LLM response for tool calling
      (callLLM as jest.Mock).mockImplementation((messages, options) => {
        if (options.tools) {
          // First call with tools
          return {
            choices: [{
              message: {
                content: 'I need to convert 1:30 to seconds',
                tool_calls: [
                  {
                    id: 'call_1',
                    function: {
                      name: 'convertDuration',
                      arguments: JSON.stringify({ format: 'MM:SS', mmss: '1:30' })
                    }
                  }
                ]
              }
            }]
          };
        } else {
          // Follow-up call with tool results
          return {
            choices: [{
              message: {
                content: 'Plank for 90 seconds'
              }
            }]
          };
        }
      });
      
      const result = await normalizeWorkoutText('Plank for 1:30');
      expect(result).toBe('Plank for 90 seconds');
      expect(callLLM).toHaveBeenCalledTimes(2);
    });
    
    it('should handle multiple conversions', async () => {
      // Mock the LLM response for tool calling
      (callLLM as jest.Mock).mockImplementation((messages, options) => {
        if (options.tools) {
          // First call with tools
          return {
            choices: [{
              message: {
                content: 'I need to convert multiple units',
                tool_calls: [
                  {
                    id: 'call_1',
                    function: {
                      name: 'convertWeight',
                      arguments: JSON.stringify({ value: 50, unit: 'kg' })
                    }
                  },
                  {
                    id: 'call_2',
                    function: {
                      name: 'convertDuration',
                      arguments: JSON.stringify({ format: 'minutes', minutes: 30 })
                    }
                  }
                ]
              }
            }]
          };
        } else {
          // Follow-up call with tool results
          return {
            choices: [{
              message: {
                content: 'Lifted 110lbs for 1800 seconds'
              }
            }]
          };
        }
      });
      
      const result = await normalizeWorkoutText('Lifted 50kg for 30 minutes');
      expect(result).toBe('Lifted 110lbs for 1800 seconds');
      expect(callLLM).toHaveBeenCalledTimes(2);
    });
    
    it('should return original text if no conversions needed', async () => {
      // Mock the LLM response with no tool calls
      (callLLM as jest.Mock).mockReturnValue({
        choices: [{
          message: {
            content: '3 sets of 10 pushups'
          }
        }]
      });
      
      const result = await normalizeWorkoutText('3 sets of 10 pushups');
      expect(result).toBe('3 sets of 10 pushups');
      expect(callLLM).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('parseWorkoutText', () => {
    it('should parse a normalized workout description', async () => {
      // Mock normalizeWorkoutText
      const normalizedText = '3 sets of 10 pushups with 110lbs, then ran for 5000 meters in 1800 seconds';
      
      // Mock the first call to normalize
      (callLLM as jest.Mock).mockImplementationOnce(() => ({
        choices: [{
          message: {
            content: normalizedText
          }
        }]
      }));
      
      // Mock the second call to parse JSON
      (callLLM as jest.Mock).mockImplementationOnce(() => ({
        choices: [{
          message: {
            content: JSON.stringify({
              name: 'Strength and Cardio',
              duration: 30,
              exercises: [
                {
                  name: 'Pushups',
                  sets: [
                    { reps: 10, weight: 110 },
                    { reps: 10, weight: 110 },
                    { reps: 10, weight: 110 }
                  ]
                },
                {
                  name: 'Running',
                  sets: [
                    { distance: 5000, duration: 1800 }
                  ]
                }
              ]
            })
          }
        }]
      }));
      
      const result = await parseWorkoutText('3 sets of 10 pushups with 50kg, then ran for 5km in 30 minutes');
      
      expect(result).toEqual({
        name: 'Strength and Cardio',
        date: expect.any(Date),
        duration: 30,
        notes: undefined,
        exercises: [
          {
            name: 'Pushups',
            notes: undefined,
            sets: [
              { reps: 10, weight: 110, duration: undefined, distance: undefined, notes: undefined },
              { reps: 10, weight: 110, duration: undefined, distance: undefined, notes: undefined },
              { reps: 10, weight: 110, duration: undefined, distance: undefined, notes: undefined }
            ]
          },
          {
            name: 'Running',
            notes: undefined,
            sets: [
              { reps: undefined, weight: undefined, duration: 1800, distance: 5000, notes: undefined }
            ]
          }
        ]
      });
      
      expect(callLLM).toHaveBeenCalledTimes(2);
    });
  });
}); 