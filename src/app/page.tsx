"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type { DataCenter } from "@/types"
import { useMetrics } from "@/hooks/useMetrics"
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics"
import { Header } from "@/components/Header"
import { Earth } from "@/components/Earth"
import { ZoomControls } from "@/components/ZoomControls"
import { StatsPanel } from "@/components/StatsPanel"
import { MobileDataCenterModal } from "@/components/MobileDataCenterModal"
import { CycleBurnRate } from "@/components/CycleBurnRate"
import { BottomMetrics } from "@/components/BottomMetrics"
import { SubnetsTable } from "@/components/SubnetsTable"
import { DataCentersModule } from "@/components/DataCentersModule"
import { NodeProvidersModule } from "@/components/NodeProvidersModule"
import { NodeMachinesModule } from "@/components/NodeMachinesModule"
import { PowerConsumptionModule } from "@/components/PowerConsumptionModule"
import { MetricsModule } from "@/components/useful" // Import the reusable component
import { useMediaQuery } from "react-responsive" // Add this import at the top
import { FooterDemo } from "@/components/footer"

export default function Dashboard() {
  const controlsRef = useRef<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { metrics, loading, topCountries } = useMetrics()
  const { metrics: realTimeMetrics, loading: realTimeLoading } = useRealTimeMetrics()

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => setMounted(true), [])

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(0.8)
      controlsRef.current.update()
    }
  }

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(0.8)
      controlsRef.current.update()
    }
  }

  const handleMobileDataCenterClick = (dataCenter: DataCenter) => {
    setSelectedDataCenter(dataCenter)
    setIsMobileModalOpen(true)
  }

  const isWide = useMediaQuery({ minWidth: 1285 })

  if (!mounted) return null; // or a loader

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-x-hidden">

      <Header />

      {/* Main Content */}
      <div className={`flex flex-col ${isWide ? "lg:flex-row" : ""} h-[calc(100vh-80px)]`}>
        {/* Left Section - Earth + Cycle Burn Rate */}
        <div className="flex-1 lg:flex-[2] xl:flex-[3] p-2 md:p-4">
          <div className="h-full bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-2xl flex flex-col">
            {/* Earth Section - Perfect centering */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden h-64 md:h-full lg:h-full">
              <div className="w-full h-full flex items-center justify-center">
                <Canvas
                  camera={{
                    position: [0, 0, isMobile ? 5 : isTablet ? 4.5 : 6],
                    fov: isMobile ? 80 : isTablet ? 75 : 45,
                  }}
                  style={{
                    background: "transparent",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} />
                  <Suspense fallback={null}>
                    <Earth
                      isMobile={isMobile}
                      isTablet={isTablet}
                      onMobileDataCenterClick={handleMobileDataCenterClick}
                    />
                  </Suspense>
                  <OrbitControls
                    ref={controlsRef}
                    enablePan={false}
                    enableZoom={false}
                    minDistance={2.5}
                    maxDistance={8}
                    enableDamping
                    dampingFactor={0.05}
                  />
                </Canvas>
              </div>
              <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
            </div>

            {/* Cycle Burn Rate Section - Compact */}
            <div className="flex-shrink-0 p-3 md:p-4 border-t border-slate-600/30 flex justify-center">
              <CycleBurnRate tcyclesPerSecond={realTimeMetrics.tcyclesPerSecond} loading={realTimeLoading} />
            </div>
          </div>
        </div>

        {/* Right Section - Stats Panel */}
        {isWide && (
          <div className="w-full lg:w-80 xl:w-96 p-2 md:p-4">
            <StatsPanel metrics={metrics} loading={loading} topCountries={topCountries} />
          </div>
        )}
      </div>

      {/* If not wide, show StatsPanel below the globe */}
      {!isWide && (
        <div className="w-full p-2 md:p-4">
          <StatsPanel metrics={metrics} loading={loading} topCountries={topCountries} />
        </div>
      )}

      {/* Bottom Metrics */}
      <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/40 backdrop-blur-sm">
        <BottomMetrics />
      </div>

      {/* Subnets Table */}
      <div className="p-2 md:p-4">
        <SubnetsTable />
      </div>

      {/* First Row of Modules */}
      <div className="p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <DataCentersModule />
          <NodeProvidersModule />
          <NodeMachinesModule />
        </div>
      </div>

      {/* Second Row of Modules - Now using the reusable MetricsModule */}
      <div className="p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <PowerConsumptionModule />
          <MetricsModule type="instructions" />
          <MetricsModule type="canisters" />
        </div>
      </div>

      {/* Third Row of Modules - New Metrics */}
      <div className="p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MetricsModule type="transactions" />
          <MetricsModule type="cycle-burn" />
          <MetricsModule type="finalization" />
        </div>
      </div>

      {/* Fourth Row of Modules - Responsive 2-Column Layout */}
      <div className="p-2 sm:p-3 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricsModule type="internet-identities" />
          <MetricsModule type="conversion-rate" />
        </div>
      </div>


      {/* Footer */}

      <FooterDemo/>


      <MobileDataCenterModal
        dataCenter={selectedDataCenter}
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </div>
  )
}