package lk.limesh.recruitment_pipeline_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Stage is required")
    @Enumerated(EnumType.STRING)
    private ApplicationStage stage;

    @NotNull(message = "Application date is required")
    private LocalDate applicationDate;

    @Min(value = 1, message = "Overall score must be at least 1")
    @Max(value = 5, message = "Overall score must be at most 5")
    private Double overallScore;

    private Boolean referred;

    private String assessmentStatus;

    // Constructor
    public Candidate() {
    }

    public Candidate(Long id, String name, ApplicationStage stage, LocalDate applicationDate,
                     Double overallScore, Boolean referred, String assessmentStatus) {
        this.id = id;
        this.name = name;
        this.stage = stage;
        this.applicationDate = applicationDate;
        this.overallScore = overallScore;
        this.referred = referred;
        this.assessmentStatus = assessmentStatus;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ApplicationStage getStage() {
        return stage;
    }

    public void setStage(ApplicationStage stage) {
        this.stage = stage;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public Boolean getReferred() {
        return referred;
    }

    public void setReferred(Boolean referred) {
        this.referred = referred;
    }

    public String getAssessmentStatus() {
        return assessmentStatus;
    }

    public void setAssessmentStatus(String assessmentStatus) {
        this.assessmentStatus = assessmentStatus;
    }
}
