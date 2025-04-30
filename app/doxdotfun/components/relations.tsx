import Spinner from "@/app/doxdotfun/components/ui/spinner";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import ForceGraph2D from "react-force-graph-2d";
import Resume from "./details/resume";

export default function Relations({ latestToken, allFunders }: { latestToken: any, allFunders: any }) {
    const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] } | null>(null);
    const graphRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 700, height: 700 });
    const [hoveredGraph, setHoveredGraph] = useState<any>(null);
    const [hoveredNode, setHoveredNode] = useState<any>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [contextMenu, setContextMenu] = useState<{node: any, x: number, y: number} | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle layout changes
    const handleRelayout = () => {
        if (fgRef.current && graphData) {
            // Create new nodes with random positions
            const newNodes = graphData.nodes.map(node => ({
                ...node,
                fx: undefined,  // Remove any fixed positions
                fy: undefined,
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height
            }));

            // Create new links with updated source and target positions
            const newLinks = graphData.links.map(link => ({
                ...link,
                source: typeof link.source === 'object' ? link.source.id : link.source,
                target: typeof link.target === 'object' ? link.target.id : link.target
            }));

            // Update the graph data through React state
            setGraphData({
                nodes: newNodes,
                links: newLinks
            });

            // Restart the simulation
            setTimeout(() => {
                const simulation = fgRef.current?.d3Force('simulation');
                if (simulation) {
                    simulation.alpha(1).restart();
                }
            }, 0);

            // Reset the zoom and pan
            fgRef.current.zoomToFit(2000);
        }
    };

    // Handle exports
    const handleExportImage = (address: string) => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Save the current canvas content
                // Save the current canvas content
                const originalContent = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Create a temporary canvas to draw the background
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');

                if (tempCtx) {
                    // Fill the temporary canvas with a solid background color
                    tempCtx.fillStyle = '#15161b'; // Set your desired background color
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                    // Draw the original canvas content on top of the background
                    tempCtx.drawImage(canvas, 0, 0);

                    // Export the temporary canvas as an image
                    const link = document.createElement('a');
                    link.download = `${address}-graph.png`;
                    link.href = tempCanvas.toDataURL('image/png');
                    link.click();
                }

                // Restore the original canvas content
                ctx.putImageData(originalContent, 0, 0);
            }
        }
    };
    const handleExportJSON = (address: string) => {
        if (!graphData) return;

        // Extract only source and target addresses for export, excluding self-loops
        const connections = graphData.links
            .filter(link => link.source.id !== link.target.id)
            .map(link => ({
                source: link.source.id,
                target: link.target.id,
            }));

        const dataStr = JSON.stringify(connections, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${address}-connections.json`;
        link.href = url;
        link.click();
    };

    // Copy address to clipboard
    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address).then(() => {
            // alert(`Copied: ${address}`);
        });
    };
    // Zoom controls
    const handleZoomIn = () => {
        if (fgRef.current) {
            const currentZoom = fgRef.current.zoom();
            fgRef.current.zoom(currentZoom * 1.35, 333);
        }
    };

    const handleZoomOut = () => {
        if (fgRef.current) {
            const currentZoom = fgRef.current.zoom();
            fgRef.current.zoom(currentZoom * 0.65, 333);
        }
    };
    const handleResetView = () => {
        if (fgRef.current) {
            fgRef.current.zoomToFit(500);
        }
    };

    // Search highlight effect
    useEffect(() => {
        if (!graphData || !searchTerm) {
            setHighlightNodes(new Set());
            return;
        }
        const matches = graphData.nodes.filter(node => 
            node.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setHighlightNodes(new Set(matches.map(node => node.id)));
    }, [searchTerm, graphData]);

    // Fetch address label dynamically
    const fetchAddressLabel = async (address: string) => {
        try {
            const response = await fetch(`/doxdotfun/api/frontend/address/label?address=${address}`);
            let data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching label for address ${address}:`, error);
            return { known: false, name: "Unknown", tag: null };
        }
    };

    const fetchGraphData = async () => {
        if (!latestToken || !latestToken.developer) return;
    
        try {
        const response = await fetch(`/doxdotfun/api/frontend/graph?address=${latestToken.developer}`);
        const data = await response.json();
        // console.log("Graph data:", data);

        // Add developer node and link to the graph data
        const developerNode = {
            id: latestToken.developer,
            color: "#86efac",
            address: latestToken.developer,
        };
        const developerLink = {
            source: latestToken.developer,
            target: latestToken.developer,
        };
        
        data.nodes = [developerNode, ...(data.nodes || [])];
        data.edges = [developerLink, ...(data.edges || [])];
        
        // Add initial nodes and link to the graph data
        const initialNodes = await Promise.all(
            (data.nodes || []).map(async (node: any) => {
            const labelData = await fetchAddressLabel(node.id);
            let color = "#86efac"; // Default color
    
            if (labelData.tag === "known") {
                color = "gray"; // Known address color
            } else if (labelData.tag === "cex") {
                color = "yellow"; // CEX address color
            }

            // const cleanName = labelData.name 
            // ? labelData.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim()
            // : '';

            return {
                id: node.id,
                name: labelData.name,
                color,
                address: node.id,
            };
            })
        );

        // Filter out invalid or duplicate nodes
        const validNodes = initialNodes.filter((node, index, self) => 
            node.id && self.findIndex(n => n.id === node.id) === index
        );
    
        const existingNodeIds = new Set(validNodes.map((node: { id: string }) => node.id));
        
        const initialLinks = (data.edges || [])
            .filter((edge: any) => existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target))
            .map((edge: any) => {
                return {
                    source: edge.source,
                    target: edge.target,
                };
            });
    
        // Add all funders to the graph, avoiding duplicates
        if (allFunders && allFunders.length > 0) {
            const funderNodes = await Promise.all(
            allFunders
                .filter((funder: string) => !existingNodeIds.has(funder))
                .map(async (funder: string) => {
                const labelData = await fetchAddressLabel(funder);
                let color = "#86efac"; // Default color

                if (labelData.tag === "known") {
                    color = "gray"; // Known address color
                } else if (labelData.tag === "cex") {
                    color = "yellow"; // CEX address color
                }

                return {
                    id: funder,
                    name: labelData.name,
                    color,
                };
                })
            );

            const funderLinks = allFunders
            .filter((funder: string) => !existingNodeIds.has(funder))
            .map((funder: string) => ({
                source: funder,
                target: latestToken.developer,
            }));
    
            setGraphData({
            nodes: [...validNodes, ...funderNodes],
            links: [...initialLinks, ...funderLinks],
            });
        } else {
            setGraphData({
            nodes: initialNodes,
            links: initialLinks,
            });
        }
            handleResetView();
        } catch (error) {
            console.error("Error fetching graph data:", error);
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    // Fetch graph data
    useEffect(() => {
        fetchGraphData();
    }, [latestToken, allFunders]);
    
    // Handle window resize
    useEffect(() => {
        const updateDimensions = () => {
            if (graphRef.current) {
                setDimensions({
                    width: graphRef.current.offsetWidth,
                    height: graphRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    // Handle node click
    const handleNodeClick = async (node: any) => {
        try {
            const labelData = await fetchAddressLabel(node.id);
            if (labelData && (labelData.tag === "cex" || labelData.tag === "dex" || labelData.tag === "known")) {
                setContextMenu(null); // Close any open context menu

                const alertDiv = document.createElement('div');
                alertDiv.textContent = `"${labelData.tag}" addresses cannot be expanded`;
                alertDiv.style.position = 'absolute';
                alertDiv.style.bottom = '10px';
                alertDiv.style.left = '10px';
                alertDiv.style.backgroundColor = '#ef8686';
                alertDiv.style.color = '#000000';
                alertDiv.style.fontWeight = 'semibold';
                alertDiv.style.padding = '10px';
                alertDiv.style.borderRadius = '5px';
                alertDiv.style.zIndex = '1000';

                if (graphRef.current) {
                    graphRef.current.appendChild(alertDiv);

                    setTimeout(() => {
                        if (graphRef.current) {
                            graphRef.current.removeChild(alertDiv);
                        }
                    }, 3000);
                }

                return;
            }

            const response = await fetch(`/doxdotfun/api/developer/allFunders/${node.id}`);
            const funderData = await response.json();

            if (funderData && funderData.all_funders) {
                const updateGraphData = async () => {
                    if (!graphData) return;

                    const newNodes = await Promise.all(
                        funderData.all_funders.map(async (funder: string) => {
                            const labelData = await fetchAddressLabel(funder);
                            let color = "#86efac"; // Default color

                            if (labelData.tag === "known") {
                                color = "gray"; // Known address color
                            } else if (labelData.tag === "cex") {
                                color = "yellow"; // CEX address color
                            }

                            return {
                                id: funder,
                                name: labelData.name,
                                color,
                                address: funder,
                            };
                        })
                    );

                    const newLinks = funderData.all_funders.map((funder: string) => ({
                        source: funder,
                        target: node.id,
                    }));

                    // Avoid duplicates
                    const existingNodeIds = new Set(graphData.nodes.map((n: { id: string }) => n.id));
                    const existingLinks = new Set(
                        graphData.links.map((l: { source: string; target: string }) => `${l.source}-${l.target}`)
                    );

                    const filteredNewNodes = newNodes.filter((n: { id: string }) => !existingNodeIds.has(n.id));
                    const filteredNewLinks = newLinks.filter(
                        (l: { source: string; target: string }) => !existingLinks.has(`${l.source}-${l.target}`)
                    );

                    setGraphData({
                        nodes: [...graphData.nodes, ...filteredNewNodes],
                        links: [...graphData.links, ...filteredNewLinks],
                    });
                };

                updateGraphData();
            }
        } catch (error) {
            console.error("Error fetching funder data:", error);
        }
    };

    // Legend component
    const Legend = () => (
        <div className="absolute bottom-4 right-4 bg-[#15161b] rounded-lg shadow-md text-xs">
            <div className="bg-[#86efac] rounded-t-xl px-3 py-1">
                <h2 className="text-xs font-medium text-black">addresses</h2>
            </div>
            <div className="p-2 text-right">
                <div className="flex items-center mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#86efac] mr-2"></div>
                    <span>regular</span>
                </div>
                <div className="flex items-center mb-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                    <span>known</span>
                </div>
                <div className="flex items-center mb-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span>CEX</span>
                </div>
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                    <span>DEX</span>
                    </div>
            </div>
        </div>
    );

    // Toolbar component
    const Toolbar = () => (
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 ">
            <div className="flex gap-2">
                <button 
                    onClick={handleZoomIn}
                    className="bg-[#86efac] text-black p-1 rounded"
                    title="zoom in"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="bg-[#86efac] text-black p-1 rounded"
                    title="zoom out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <button 
                    onClick={handleResetView}
                    className="bg-[#86efac] text-black p-1 rounded hover:bg-[#4ade80] transition-colors"
                    title="fit to screen"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <button 
                    onClick={handleRelayout}
                    className="bg-[#86efac] text-black p-1 rounded hover:bg-[#4ade80] transition-colors"
                    title="reset layout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path 
                        fillRule="evenodd" 
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                        clipRule="evenodd" 
                    />
                    </svg>
                </button>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleExportImage(latestToken.developer)}
                    className="bg-[#86efac] text-black p-1 rounded text-xs"
                    title="export as PNG"
                >
                    save image
                </button>
                <button 
                    onClick={() => handleExportJSON(latestToken.developer)}
                    className="bg-[#86efac] text-black p-1 rounded text-xs"
                    title="Export as JSON"
                >
                    export JSON
                </button>
            </div>
            <input
                type="text"
                placeholder="search an address in the graph"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-1 text-xs rounded bg-[#1f232e] text-white border border-[#86efac] w-[250px]"
            />
        </div>
    );

    const router = useRouter(); // Initialize router

    const handleNavigate = (address: string) => {
        router.push(`/doxdotfun/audit/${address}`); // Navigate to the auditor page
      };
    
    return (
        <div className="shadow-lg rounded-xl bg-[#1f232e] p-0 col-span-full w-full flex flex-col">
            <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                <h2 className="text-sm font-medium text-black">relations</h2>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-full w-full">
                    <Spinner />
                </div>
            ) : graphData ? (
                <div className="px-1 py-1 flex relative h-screen md:h-auto">
                    <div
                        ref={graphRef}
                        className="mr-1"
                        style={{ width: dimensions.width, height: dimensions.height }}
                        onMouseEnter={() => setHoveredGraph(true)}
                        onMouseLeave={() => setHoveredGraph(false)}
                    >
                        
                        <ForceGraph2D
                            ref={fgRef}
                            graphData={graphData}
                            nodeAutoColorBy="color"
                            linkDirectionalArrowLength={2.5}
                            linkDirectionalArrowRelPos={.5}
                            linkCurvature={0}
                            linkWidth={.75}
                            linkColor={() => "#727272"}
                            // nodeLabel={() => `click to scan`}
                            nodeLabel={() => `right click for more actions`}
                            dagLevelDistance={250}
                            onNodeDragEnd={(node: any) => {
                                node.fx = node.x;
                                node.fy = node.y;
                            }}
                            onNodeClick={handleNodeClick}
                            onNodeHover={(node) => setHoveredNode(node)}
                            onNodeRightClick={(node, event) => {
                                event.preventDefault();
                                setContextMenu({
                                    node,
                                    x: event.clientX,
                                    y: event.clientY
                                });
                            }}
                            width={dimensions.width}
                            height={dimensions.height}
                            enableNodeDrag={true}
                            nodeCanvasObject={(node, ctx, globalScale) => {
                                const label = node.id;
                                const name = node.name;
                                const fontSize = 10 / globalScale;
                                ctx.font = `${fontSize}px Sans-Serif`;
                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";
                            
                                // Highlight searched nodes
                                const isHighlighted = highlightNodes.has(node.id);
                                const nodeSize = isHighlighted ? 15 : (hoveredNode && hoveredNode.id === node.id ? 12 : 10);

                                ctx.fillStyle = isHighlighted ? "#ff0000" : node.color;
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, nodeSize / globalScale, 0, 2 * Math.PI, false);
                                ctx.fill();

                                // if (isHighlighted || (hoveredNode && hoveredNode.id === node.id && node.color !== "#86efac")) {
                                if (isHighlighted || (hoveredNode && hoveredNode.id === node.id && node.color !== "#86efac")) {
                                    ctx.fillStyle = "#ffffff";
                                    // ctx.fillText(name, node.x, node.y + 20 / globalScale);
                                    // console.log("node", node);
                                }

                                // Show address if node is regular
                                if (node.color === "yellow") {
                                    ctx.fillStyle = "#ffffff";
                                    ctx.fillText(name, node.x, node.y + 18 / globalScale);
                                }

                                // Show address if node is regular
                                if (node.color === "#86efac") {
                                    ctx.fillStyle = "#ffffff";
                                    ctx.fillText(label, node.x, node.y + 18 / globalScale);
                                }

                                // // Show label if node is CEX
                                // if (node.color === "#86efac") {
                                //     ctx.fillStyle = "#ffffff";
                                //     ctx.fillText(label, node.x, node.y - 15 / globalScale);
                                // }
                            }}
                        />
                        
                        <Toolbar />
                        <Legend />
                        
                        {!hoveredGraph && (
                            <div className="bg-gradient-to-r from-[hsl(219,22%,5%)] to-transparent bg-opacity-20 z-1000 w-[500px] md:w-[700px] xl:w-[700px] absolute hover:bg-red-50 inset-0 rounded-bl-none xl:rounded-bl-xl flex justify-center items-center bg-gradient-to-r from-[#00000000] to-[#ffffff00] text-white dark:text-white  text-sm font-bold pointer-events-none transition-opacity duration-300 opacity-100 hover:opacity-0">
                                
                                <div className="relative z-10 p-6 py-2 max-w-md text-center bg-[#1f232e]/20 border border-[#86efac]/30 rounded-xl shadow-xl animate-fade-in">
                                    <div className="my-2">
                                        <p className="text-sm text-[#86efac] font-mono animate-pulse lowercase">
                                            INTERACTIVE RELATIONSHIP GRAPH
                                        </p>
                                        <h3 className="text-2xl font-bold text-white lowercase">
                                            Explore Token Connections
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-2 text-left text-sm text-white/80 lowercase">
                                        <div className="flex items-start space-x-2">
                                            <div className="mt-0.5 flex-shrink-0 text-[#86efac]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p>Click nodes to expand connections</p>
                                        </div>
                                        
                                        <div className="flex items-start space-x-2 lowercase">
                                            <div className="mt-0.5 flex-shrink-0 text-[#86efac]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p>Right-click for node actions</p>
                                        </div>
                                        
                                        <div className="flex items-start space-x-2 lowercase">
                                            <div className="mt-0.5 flex-shrink-0 text-[#86efac]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p>Use toolbar for advanced controls</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 animate-bounce">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 mx-auto text-[#86efac]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                            </svg>                                         
                                        <p className="mt-1 text-xs text-[#86efac] lowercase">BEGIN EXPLORING</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* {hoveredNode && (
                            <div className="">
                                <div className="absolute top-0 left-0 m-2 w-[150px]">
                                    <NodeDetails ip={""} launches={0} lastSeen={""}  />
                                </div>
                            </div>
                        )} */}
                        
                        {contextMenu && (
                            <div 
                                className="fixed left-0 shadow-lg rounded-xl bg-[#15161b] z-50"
                                style={{
                                    left: contextMenu.x,
                                    top: contextMenu.y
                                }}
                                onMouseLeave={() => setContextMenu(null)}
                            >
                                <div className="bg-[#86efac] rounded-t-xl px-6 py-2">
                                    <h2 className="text-sm font-bold text-black">{contextMenu.node.name || ""}</h2>
                                </div>
                                <div className="text-white px-6 py-3 text-xs flex items-center justify-between space-x-2">
                                    <p className="">
                                        {contextMenu.node.id || "N/A"}
                                    </p>
                                    <a
                                        href={`https://solscan.io/account/${contextMenu.node.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <button
                                            className="px-2 py-2 border-[1px] border-[#86efac] hover:bg-[#34c55e] text-white rounded-lg font-semibold flex items-center justify-center"
                                        >
                                            <img
                                            src="/icons/doxdotfun/solscan-logo-light.svg"
                                            alt="open in solscan"
                                            className="w-4 h-4"
                                            />
                                        </button>
                                    </a>
                                </div>
                                <div className="p-2 pt-0 text-center text-xs flex space-x-1">
                                    <button 
                                        onClick={() => handleNavigate(contextMenu.node.id)}
                                        className="block w-full px-3 md:px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold"
                                    >
                                        audit
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleCopyAddress(contextMenu.node.id);
                                            setContextMenu(null);
                                        }}
                                        className="block w-full px-3 md:px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold"
                                    >
                                        copy address
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleNodeClick(contextMenu.node);
                                            setContextMenu(null);
                                        }}
                                        className="block w-full px-3 md:px-4 py-2 bg-[#86efac] hover:bg-[#34c55e] text-black rounded-lg font-semibold"
                                    >
                                        expand node
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-3 md:relative md:p-3 md:flex-1 md:block absolute bottom-0 left-0 w-full md:w-auto border-l-[0px] md:border-l-[1px] border-[#86efac] hidden xl:block lg:hidden">
                        <Resume address={latestToken.developer} ip={latestToken.ip}/>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-full w-full">
                    <Spinner />
                </div>
            )}
            <div className="flex-1 p-3 relative p-3 flex-1 block w-full md:w-auto xl:hidden">
                <Resume address={latestToken.developer} ip={latestToken.ip}/>
            </div>
        </div>
    );
}
