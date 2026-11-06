package NestVantage.API.service;

import NestVantage.API.entity.PropertyFactSheet;
import NestVantage.API.repository.PropertyFactSheetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PropertyFactSheetService {

    private final PropertyFactSheetRepository repository;

    public PropertyFactSheetService(PropertyFactSheetRepository repository) {
        this.repository = repository;
    }

    public List<PropertyFactSheet> getAllFactSheets() {
        return repository.findAll();
    }

    public List<PropertyFactSheet> getActiveFactSheets() {
        return repository.findByActiveTrue();
    }

    public PropertyFactSheet getFactSheet(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Property fact sheet not found."));
    }

    public PropertyFactSheet createFactSheet(PropertyFactSheet factSheet) {
        validate(factSheet);
        return repository.save(factSheet);
    }

    @Transactional
    public PropertyFactSheet updateFactSheet(Long id, PropertyFactSheet updated) {
        validate(updated);

        PropertyFactSheet existing = getFactSheet(id);

        existing.setProjectName(updated.getProjectName());
        existing.setLocation(updated.getLocation());
        existing.setConfigurations(updated.getConfigurations());
        existing.setPriceRange(updated.getPriceRange());
        existing.setAmenities(updated.getAmenities());
        existing.setDescription(updated.getDescription());
        existing.setActive(updated.isActive());

        return repository.save(existing);
    }

    public void deleteFactSheet(Long id) {
        PropertyFactSheet existing = getFactSheet(id);
        repository.delete(existing);
    }

    private void validate(PropertyFactSheet factSheet) {
        if (factSheet.getProjectName() == null ||
                factSheet.getProjectName().isBlank()) {
            throw new IllegalArgumentException("Project name is required.");
        }

        if (factSheet.getLocation() == null ||
                factSheet.getLocation().isBlank()) {
            throw new IllegalArgumentException("Project location is required.");
        }
    }
}