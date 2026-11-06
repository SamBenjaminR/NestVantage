package NestVantage.API.controller;

import NestVantage.API.entity.PropertyFactSheet;
import NestVantage.API.service.PropertyFactSheetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/property-fact-sheets")
@CrossOrigin(origins = "http://localhost:5173")
public class PropertyFactSheetController {

    private final PropertyFactSheetService service;

    public PropertyFactSheetController(PropertyFactSheetService service) {
        this.service = service;
    }

    @GetMapping
    public List<PropertyFactSheet> getAll() {
        return service.getAllFactSheets();
    }

    @GetMapping("/active")
    public List<PropertyFactSheet> getActive() {
        return service.getActiveFactSheets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getFactSheet(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PropertyFactSheet factSheet) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(service.createFactSheet(factSheet));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody PropertyFactSheet factSheet) {
        try {
            return ResponseEntity.ok(service.updateFactSheet(id, factSheet));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteFactSheet(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}