#include <emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;
const unsigned kRenderQuantumFrames = 128;
const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

class ProcessorPerf
{
public:
    ProcessorPerf() {}
    int processPerf(
        uintptr_t input_ptr,
        uintptr_t output_ptr,
        int channel_count,
        int play_head)
    {
        float **input_buffer = reinterpret_cast<float **>(input_ptr);
        float **output_buffer = reinterpret_cast<float **>(output_ptr);

        for (int i = 0; i < kRenderQuantumFrames; i++)
        {
            // int last_quantum_frame =
            // if (!playing) continue;
            for (unsigned channel = 0; channel < channel_count; ++channel)
            {
                *(output_buffer + (channel * kRenderQuantumFrames) + i) = *(input_buffer + (channel * kRenderQuantumFrames) + i);
            }
            play_head++;
        }
        return play_head;
    }
};

EMSCRIPTEN_BINDINGS(CLASS_ProcessorPerf)
{
    class_<ProcessorPerf>("ProcessorPerf")
        .constructor()
        .function("processPerf", &ProcessorPerf::processPerf, allow_raw_pointers());
}