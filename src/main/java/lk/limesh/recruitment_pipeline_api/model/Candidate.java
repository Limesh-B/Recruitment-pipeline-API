package lk.limesh.recruitment_pipeline_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    private Double overallScore;

    private Boolean referred;

    private String assessmentStatus;
}
