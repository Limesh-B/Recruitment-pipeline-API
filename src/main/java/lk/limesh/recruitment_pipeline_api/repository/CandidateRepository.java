package lk.limesh.recruitment_pipeline_api.repository;

import lk.limesh.recruitment_pipeline_api.model.ApplicationStage;
import lk.limesh.recruitment_pipeline_api.model.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByStage(ApplicationStage stage);
    Page<Candidate> findByStage(ApplicationStage stage, Pageable pageable);
}
