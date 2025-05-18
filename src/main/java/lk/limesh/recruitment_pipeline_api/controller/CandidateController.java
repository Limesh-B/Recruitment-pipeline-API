package lk.limesh.recruitment_pipeline_api.controller;

import lk.limesh.recruitment_pipeline_api.model.ApplicationStage;
import lk.limesh.recruitment_pipeline_api.model.Candidate;
import lk.limesh.recruitment_pipeline_api.service.CandidateService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    @Autowired
    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @PostMapping
    public ResponseEntity<Candidate> createCandidate(@Valid @RequestBody Candidate candidate) {
        Candidate createdCandidate = candidateService.createCandidate(candidate);
        return new ResponseEntity<>(createdCandidate, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        Candidate candidate = candidateService.getCandidateById(id);
        return ResponseEntity.ok(candidate);
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Candidate>> getAllCandidatesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Candidate> candidates = candidateService.getAllCandidatesPaginated(pageable);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/stage/{stage}")
    public ResponseEntity<List<Candidate>> getCandidatesByStage(@PathVariable ApplicationStage stage) {
        List<Candidate> candidates = candidateService.getCandidatesByStage(stage);
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/stage/{stage}/paginated")
    public ResponseEntity<Page<Candidate>> getCandidatesByStage(
            @PathVariable ApplicationStage stage,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Candidate> candidates = candidateService.getCandidatesByStage(stage, pageable);
        return ResponseEntity.ok(candidates);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody Candidate candidate) {
        Candidate updatedCandidate = candidateService.updateCandidate(id, candidate);
        return ResponseEntity.ok(updatedCandidate);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Candidate>> searchCandidatesByName(@RequestParam String name) {
        List<Candidate> candidates = candidateService.searchCandidatesByName(name);
        return ResponseEntity.ok(candidates);
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<?> updateCandidateStage(
            @PathVariable Long id,
            @RequestBody Map<String, String> stageUpdate) {

        if (!stageUpdate.containsKey("stage")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "timestamp", LocalDateTime.now(),
                    "status", HttpStatus.BAD_REQUEST.value(),
                    "error", "Missing 'stage' key in request body"
            ));
        }

        try {
            String stageValue = stageUpdate.get("stage");
            Candidate updatedCandidate = candidateService.updateCandidateStage(id, stageValue);
            return ResponseEntity.ok(updatedCandidate);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "timestamp", LocalDateTime.now(),
                    "status", HttpStatus.BAD_REQUEST.value(),
                    "error", "Invalid 'stage' value",
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }
}