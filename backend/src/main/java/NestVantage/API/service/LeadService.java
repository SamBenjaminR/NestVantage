
package NestVantage.API.service;

import NestVantage.API.dto.LeadRequest;
import NestVantage.API.entity.Lead;
import NestVantage.API.repository.LeadRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LeadService {

    private final LeadRepository leadRepository;

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    // Retrieve all leads
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    // Retrieve a lead using its database ID
    public Optional<Lead> getLeadById(Long id) {
        return leadRepository.findById(id);
    }

    // Retrieve a lead using its business lead code
    public Optional<Lead> getLeadByCode(String leadCode) {
        return leadRepository.findByLeadCode(leadCode);
    }

    // Create and save a new lead
    @Transactional
    public Lead createLead(LeadRequest request) {

        // Prevent duplicate lead codes
        if (leadRepository.existsByLeadCode(request.leadCode())) {
            throw new IllegalArgumentException("A lead with this lead code already exists.");
            
        }
        if (leadRepository.existsByPhone(request.phone())) {
            throw new IllegalArgumentException("A lead with this phone number already exists.");
        }

        // Convert the request DTO into a database entity
        Lead lead = new Lead();

        lead.setLeadCode(request.leadCode());
        lead.setBuyerName(request.buyerName());
        lead.setPhone(request.phone());
        lead.setSource(request.source());
        lead.setProjectName(request.projectName());
        lead.setBhkType(request.bhkType());
        lead.setBudget(request.budget());
        lead.setStatus("New Lead");

        return leadRepository.save(lead);
    }
    @Transactional
public Optional<Lead> updateLead(Long id, LeadRequest request) {
    Optional<Lead> existingLead = leadRepository.findById(id);
    

    if (existingLead.isEmpty()) {
        return Optional.empty();
    }
    

    Lead lead = existingLead.get();


        System.out.println("Updating database ID: " + id);
System.out.println("Requested lead code: " + request.leadCode());

String normalizedLeadCode = request.leadCode().trim();

Optional<Lead> leadWithSameCode =
        leadRepository.findByLeadCode(normalizedLeadCode);

if (leadWithSameCode.isPresent()) {
    System.out.println("Existing lead database ID: "
            + leadWithSameCode.get().getId());
}

if (leadWithSameCode.isPresent()
        && !leadWithSameCode.get().getId().equals(id)) {
    throw new IllegalArgumentException("Lead code already exists");
}
if (leadRepository.existsByPhoneAndIdNot(request.phone(), id)) {
    throw new IllegalArgumentException(
            "A lead with this phone number already exists."
    );
}

    lead.setLeadCode(request.leadCode().trim());
    lead.setBuyerName(request.buyerName());
    lead.setPhone(request.phone());
    lead.setSource(request.source());
    lead.setProjectName(request.projectName());
    lead.setBhkType(request.bhkType());
    lead.setBudget(request.budget());

    return Optional.of(leadRepository.save(lead));
    }
    
}
