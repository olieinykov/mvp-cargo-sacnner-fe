import type { Inspection } from "../../lib/api/company";
import { CI_STATUS_LABELS, INSP_LEVEL_LABELS } from "../../lib/utils/constants";
import { fmtDate } from "../../lib/utils/date";
import { Modal } from "../ui/dialog";
import { DetailRow } from "../ui/InfoRow";
import { YesNoBadge } from "../ui/YesNo";
import { ViolationsSection } from "./ViolationsSection";

type InspectionDetailModalProps = {
  inspection: Inspection | null;
  open: boolean;
  onClose: () => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({
  inspection,
  open,
  onClose,
}) => {
  if (!open || !inspection) return null;

  const level = inspection.insp_level_id != null ? INSP_LEVEL_LABELS[inspection.insp_level_id] ?? `Level ${inspection.insp_level_id}` : '—';
  const status = inspection.ci_status_code ? (CI_STATUS_LABELS[inspection.ci_status_code] ?? inspection.ci_status_code) : '—';

  return (
    <Modal
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title={`Inspection ${inspection.inspection_id}`}
      description={`Reported in ${inspection.report_state} · ${fmtDate(inspection.insp_date)}`}
    >
      {/* ── Overview ── */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <DetailRow label="Date">{fmtDate(inspection.insp_date)}</DetailRow>
        <DetailRow label="State">{inspection.report_state}</DetailRow>
        <DetailRow label="Level">{level}</DetailRow>
        <DetailRow label="Status">{status}</DetailRow>
        <DetailRow label="Report #">{inspection.report_number ?? '—'}</DetailRow>
        <DetailRow label="Facility">{inspection.insp_facility ?? '—'}</DetailRow>
        <DetailRow label="Post Accident"><YesNoBadge value={inspection.post_acc_ind}/></DetailRow>
        <DetailRow label="Hazmat Placards Req."><YesNoBadge value={inspection.hazmat_placard_req}/></DetailRow>
        <DetailRow label="Location">{inspection.location_desc ?? '—'}</DetailRow>
      </div>

      {/* ── Carrier at time ── */}
      {(inspection.insp_carrier_name || inspection.insp_carrier_city) && (
        <div className="mb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Carrier at Time of Inspection
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <DetailRow label="Name">{inspection.insp_carrier_name ?? '—'}</DetailRow>
            <DetailRow label="City">{inspection.insp_carrier_city ?? '—'}</DetailRow>
            <DetailRow label="State">{inspection.insp_carrier_state ?? '—'}</DetailRow>
          </div>
        </div>
      )}

      {/* ── Violations summary ── */}
      <div className="mb-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Violation Totals
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Violations', val: inspection.viol_total },
            { label: 'Total OOS', val: inspection.oos_total },
            { label: 'Driver Violations', val: inspection.driver_viol_total },
            { label: 'Vehicle Violations', val: inspection.vehicle_viol_total },
            { label: 'Hazmat Violations', val: inspection.hazmat_viol_total },
          ].map(({ label, val }) => (
            <DetailRow key={label} label={label}>
              {val != null ? (
                <span className={`font-mono text-base font-bold ${val > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {val}
                </span>
              ) : '—'}
            </DetailRow>
          ))}
        </div>
      </div>

      {/* ── Enforcement checks ── */}
      <div className="mb-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Enforcement Checks
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <DetailRow label="Alcohol / Controlled Sub."><YesNoBadge value={inspection.alcohol_control_sub}/></DetailRow>
          <DetailRow label="Drug Interdiction"><YesNoBadge value={inspection.drug_intrdctn_search}/></DetailRow>
        </div>
      </div>

      {/* ── Violations list ── */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Violations
        </p>
        <ViolationsSection inspectionId={inspection.id} />
      </div>
    </Modal>
  );
}