package lk.limesh.recruitment_pipeline_api.service;

import lk.limesh.recruitment_pipeline_api.exception.ResourceNotFoundException;
import lk.limesh.recruitment_pipeline_api.model.ApplicationStage;
import lk.limesh.recruitment_pipeline_api.model.Candidate;
import lk.limesh.recruitment_pipeline_api.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;

    @Autowired
    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Page<Candidate> getAllCandidatesPaginated(Pageable pageable) {
        return candidateRepository.findAll(pageable);
    }

    public List<Candidate> getCandidatesByStage(ApplicationStage stage) {
        return candidateRepository.findByStage(stage);
    }

    public Page<Candidate> getCandidatesByStage(ApplicationStage stage, Pageable pageable) {
        return candidateRepository.findByStage(stage, pageable);
    }

    public Candidate updateCandidate(Long id, Candidate candidateDetails) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        candidate.setName(candidateDetails.getName());
        candidate.setStage(candidateDetails.getStage());
        candidate.setApplicationDate(candidateDetails.getApplicationDate());
        candidate.setOverallScore(candidateDetails.getOverallScore());
        candidate.setReferred(candidateDetails.getReferred());
        candidate.setAssessmentStatus(candidateDetails.getAssessmentStatus());

        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidateStage(Long id, String stageValue) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));

        try {
            ApplicationStage newStage = ApplicationStage.valueOf(stageValue.toUpperCase());
            candidate.setStage(newStage);
            return candidateRepository.save(candidate);

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid stage value: '" + stageValue +
                    "'. Allowed values: " + Arrays.toString(ApplicationStage.values()));
        }
    }

    public void deleteCandidate(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
        candidateRepository.delete(candidate);
    }
}
