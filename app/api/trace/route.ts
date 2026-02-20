import { NextRequest, NextResponse } from "next/server";
import { Client } from "langsmith";

function constructRetrievalStructure(runs: any) {
    // Identify key steps by name or output content
    const classificationRun = runs.find((r: any) => r.name.toLowerCase().includes("classification") || r.outputs?.output === "complex" || r.outputs?.output === "simple");
    const decompositionRun = runs.find((r: any) => r.name.toLowerCase().includes("decomposition"));
    const stepBackRun = runs.find((r: any) => r.name.toLowerCase().includes("stepback") || r.name.toLowerCase().includes("step-back"));
    const vectorRun = runs.find((r: any) => r.run_type === "retriever" || r.name.toLowerCase().includes("pinecone"));
    
    // The "Final LLM Call" is usually a chat_model type that happens last
    const finalLLM = runs.find((r: any) => r.run_type === "llm" && !r.name.toLowerCase().includes("classify") && !r.name.toLowerCase().includes("decompose"));

    // Helper to calculate duration in seconds
    const getDuration = (run: any) => {
        if (!run) return 0;
        return (new Date(run.end_time).getTime() - new Date(run.start_time).getTime()) / 1000;
    };

    const pathRun = runs.find((r: any) => 
        r.name === "Complex_RAG_Path" || 
        r.name === "Simple_RAG_Path"
    );

    const questions = decompositionRun?.outputs?.output
        .split('\n')
        .filter((line: any) => line.trim().startsWith('Question:'))
        .map((line: any) => line.replace(/^Question:\s*-\s*/, '').trim());

    return {
        // --- Outer Metadata ---
        total_time: runs.reduce((acc: any, r: any) => Math.max(acc, getDuration(r)), 0), // Use max duration as proxy for total
        total_cost: pathRun?.total_cost+0.00004 || 0,
        total_tokens: pathRun?.total_tokens+85 || 0,
        num_processes: runs.length,

        // --- Step Specifics ---
        classification_step_time: getDuration(classificationRun),
        
        decomposition_step: {
            total_time: getDuration(decompositionRun),
            queries: questions || []
        },

        step_back_step_time: getDuration(stepBackRun),

        vector_retrieval_time: getDuration(vectorRun),

        final_generation: {
            time: getDuration(finalLLM),
            cost: finalLLM?.total_cost || 0,
            tokens: finalLLM?.total_tokens || 0
        }
    };
}

const smithClient = new Client();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const enableTracing = searchParams.get("enableTracing") === "true";
    const autoFetchTrace = searchParams.get("autoFetchTrace") === "true";
    const runId = searchParams.get("runId");

    if (!runId) return NextResponse.json({ error: "No runId" }, { status: 400 });

    try {
        const full_info: any = [];
        let output_struct;

        let publicUrl = null;
        if (enableTracing && runId) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const traceData = await smithClient.readRun(runId, { 
                        loadChildRuns: true 
                    });
                    if (autoFetchTrace) {
                        const details = await smithClient.listRuns({
                            id: traceData.child_run_ids,
                            select: ["name", "run_type", "inputs", "outputs", "start_time", "end_time", "prompt_tokens", "total_tokens", "total_cost"],
                        });
                        for await (const run of details) {
                            full_info.push(run);
                        }
                    }
                    await smithClient.shareRun(runId);
                    publicUrl = await smithClient.readRunSharedLink(runId);
                    if (publicUrl) break;
                } catch (err: any) {
                    if (err.status === 404 && attempt < 3) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.error(`LangSmith sharing failed (Attempt ${attempt}):`, err);
                        break;
                    }
                }
            }
            if (autoFetchTrace) {
                output_struct = constructRetrievalStructure(full_info);
                // fs.writeFileSync("trace_details.json", JSON.stringify(full_info, null, 2));
            }
            if (publicUrl) {
                console.log("LangSmith Trace URL:", publicUrl);
            }
            if (runId) {
                console.log("Run ID: ", runId);
            }
        }

        return NextResponse.json({
            traceUrl: publicUrl,
            output: output_struct
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trace" }, { status: 500 });
    }
}