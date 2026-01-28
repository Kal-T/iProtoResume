package graph

import (
	"github.com/iprotoresume/gateway-go/graph/model"
	pb "github.com/iprotoresume/shared/proto"
)

func mapExperienceInput(inputs []*model.ExperienceInput) []*pb.Experience {
	var results []*pb.Experience
	for _, in := range inputs {
		results = append(results, &pb.Experience{
			Title:       in.Title,
			Company:     in.Company,
			StartDate:   getStringValue(in.StartDate),
			EndDate:     getStringValue(in.EndDate),
			Description: getStringValue(in.Description),
		})
	}
	return results
}

func mapEducationInput(inputs []*model.EducationInput) []*pb.Education {
	var results []*pb.Education
	for _, in := range inputs {
		results = append(results, &pb.Education{
			Degree:         in.Degree,
			Institution:    in.Institution,
			GraduationDate: getStringValue(in.GraduationDate),
		})
	}
	return results
}

func mapProjectInput(inputs []*model.ProjectInput) []*pb.Project {
	var results []*pb.Project
	for _, in := range inputs {
		results = append(results, &pb.Project{
			Title:       in.Title,
			Description: in.Description,
			TechStack:   in.TechStack,
			Date:        getStringValue(in.Date),
			Location:    getStringValue(in.Location),
		})
	}
	return results
}

func mapCertificateInput(inputs []*model.CertificateInput) []*pb.Certificate {
	var results []*pb.Certificate
	for _, in := range inputs {
		results = append(results, &pb.Certificate{
			Name:   in.Name,
			Issuer: in.Issuer,
			Date:   getStringValue(in.Date),
			Link:   getStringValue(in.Link),
		})
	}
	return results
}

func mapSkillGroupInput(inputs []*model.SkillGroupInput) []*pb.SkillGroup {
	var results []*pb.SkillGroup
	for _, in := range inputs {
		results = append(results, &pb.SkillGroup{
			Category: in.Category,
			Items:    in.Items,
		})
	}
	return results
}

func mapLanguageInput(inputs []*model.LanguageInput) []*pb.Language {
	var results []*pb.Language
	for _, in := range inputs {
		results = append(results, &pb.Language{
			Language:    in.Language,
			Proficiency: in.Proficiency,
		})
	}
	return results
}

func mapAchievementInput(inputs []*model.AchievementInput) []*pb.Achievement {
	var results []*pb.Achievement
	for _, in := range inputs {
		results = append(results, &pb.Achievement{
			Title:       in.Title,
			Description: in.Description,
		})
	}
	return results
}

func mapProtoResumeToModel(p *pb.ResumeData) *model.ResumeData {
	if p == nil {
		return &model.ResumeData{}
	}

	var projects []*model.Project
	for _, prj := range p.Projects {
		projects = append(projects, &model.Project{
			Title:       prj.Title,
			Description: prj.Description,
			TechStack:   prj.TechStack,
			Date:        &prj.Date,
			Location:    &prj.Location,
		})
	}

	var certs []*model.Certificate
	for _, cert := range p.Certificates {
		certs = append(certs, &model.Certificate{
			Name:   cert.Name,
			Issuer: cert.Issuer,
			Date:   &cert.Date,
			Link:   &cert.Link,
		})
	}

	var exp []*model.Experience
	for _, e := range p.Experience {
		exp = append(exp, &model.Experience{
			Title:       e.Title,
			Company:     e.Company,
			StartDate:   &e.StartDate,
			EndDate:     &e.EndDate,
			Description: &e.Description,
		})
	}

	var edu []*model.Education
	for _, e := range p.Education {
		edu = append(edu, &model.Education{
			Degree:         e.Degree,
			Institution:    e.Institution,
			GraduationDate: &e.GraduationDate,
		})
	}

	var skillGroups []*model.SkillGroup
	for _, sg := range p.SkillGroups {
		skillGroups = append(skillGroups, &model.SkillGroup{
			Category: sg.Category,
			Items:    sg.Items,
		})
	}

	var languages []*model.Language
	for _, lang := range p.Languages {
		languages = append(languages, &model.Language{
			Language:    lang.Language,
			Proficiency: lang.Proficiency,
		})
	}

	var achievements []*model.Achievement
	for _, ach := range p.Achievements {
		achievements = append(achievements, &model.Achievement{
			Title:       ach.Title,
			Description: ach.Description,
		})
	}

	return &model.ResumeData{
		FullName:     p.FullName,
		Email:        p.Email,
		Phone:        &p.Phone,
		Summary:      &p.Summary,
		Skills:       p.Skills,
		Experience:   exp,
		Education:    edu,
		Projects:     projects,
		Certificates: certs,
		JobTitle:     &p.JobTitle,
		Location:     &p.Location,
		Linkedin:     &p.Linkedin,
		Github:       &p.Github,
		Website:      &p.Website,
		ProfileImage: &p.ProfileImage,
		SkillGroups:  skillGroups,
		Languages:    languages,
		Achievements: achievements,
	}
}

func stringPtr(s string) *string {
	return &s
}

func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
