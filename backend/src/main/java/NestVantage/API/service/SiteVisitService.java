package NestVantage.API.service;

import NestVantage.API.dto.SiteVisitRequest;
import NestVantage.API.entity.Lead;
import NestVantage.API.entity.SiteVisit;
import NestVantage.API.repository.LeadRepository;
import NestVantage.API.repository.SiteVisitRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SiteVisitService {

    private final SiteVisitRepository siteVisitRepository;
    private final LeadRepository leadRepository;

    public SiteVisitService(
            SiteVisitRepository siteVisitRepository,
            LeadRepository leadRepository) {
        this.siteVisitRepository = siteVisitRepository;
        this.leadRepository = leadRepository;
    }

    @Transactional
    public SiteVisit bookVisit(SiteVisitRequest request) {

        Lead lead = leadRepository.findById(request.leadId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Lead not found."));

        boolean slotBooked =
                siteVisitRepository
                        .existsByProjectNameAndVisitDateAndVisitTimeAndStatus(
                                request.projectName(),
                                request.visitDate(),
                                request.visitTime(),
                                "Booked"
                        );

        if (slotBooked) {
            throw new IllegalArgumentException(
                    "This time slot is already booked. Please choose another slot."
            );
        }

        SiteVisit visit = new SiteVisit();

        visit.setVisitCode("VIS-" + UUID.randomUUID()
                .toString().substring(0, 8).toUpperCase());
        visit.setLead(lead);
        visit.setProjectName(request.projectName());
        visit.setVisitDate(request.visitDate());
        visit.setVisitTime(request.visitTime());
        visit.setStatus("Booked");

        try {
            return siteVisitRepository.saveAndFlush(visit);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException(
                    "This time slot is already booked. Please choose another slot."
            );
        }
    }

    public List<SiteVisit> getAllBookings() {
        return siteVisitRepository
                .findByStatusOrderByVisitDateAscVisitTimeAsc("Booked");
    }

    @Transactional
    public void cancelVisit(Long id) {

        SiteVisit visit = siteVisitRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found."));

        siteVisitRepository.delete(visit);
    }
}